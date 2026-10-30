// Multi-Tab Auto Solver - Solves tests across all tabs
// Works with Foxford, Yandex.Tutor, Stepik, and other platforms

const MultiTabSolver = {
    // Current state
    isRunning: false,
    currentTabIndex: 0,
    tabs: [],
    solvedTabs: 0,
    failedTabs: 0,
    callback: null,
    
    // Platform URLs to target
    targetPlatforms: [
        'foxford',
        'yandex.tutor',
        'tutor.yandex',
        'stepik',
        'skillbox',
        'geekbrains',
        'eduson',
        'coursera',
        'udemy',
        'open.edu',
        'lektorium',
        'intuit',
        'university',
        'test',
        'exam',
        'quiz',
        'task',
        'lesson',
        'course'
    ],
    
    // Start solving across all tabs
    start: function(callback) {
        if (this.isRunning) {
            console.log('⚠️ Multi-tab solver already running');
            return false;
        }
        
        this.isRunning = true;
        this.currentTabIndex = 0;
        this.solvedTabs = 0;
        this.failedTabs = 0;
        this.callback = callback || function() {};
        
        console.log('🚀 Multi-Tab Solver started');
        
        // Get all tabs with target platforms
        this.getTargetTabs();
        
        return true;
    },
    
    // Stop solving
    stop: function() {
        this.isRunning = false;
        console.log('❌ Multi-Tab Solver stopped');
        
        if (this.callback) {
            this.callback({
                action: 'stopped',
                solved: this.solvedTabs,
                failed: this.failedTabs
            });
        }
        
        return true;
    },
    
    // Get all tabs with target platforms
    getTargetTabs: function() {
        chrome.tabs.query({}, (tabs) => {
            this.tabs = tabs.filter(tab => {
                if (!tab.url) return false;
                
                // Check if URL matches any target platform
                const url = tab.url.toLowerCase();
                return this.targetPlatforms.some(platform => 
                    url.includes(platform)
                );
            });
            
            console.log(`📋 Found ${this.tabs.length} tabs with target platforms`);
            
            if (this.tabs.length === 0) {
                console.log('⚠️ No tabs with target platforms found');
                this.isRunning = false;
                if (this.callback) {
                    this.callback({action: 'no_tabs', solved: 0, failed: 0});
                }
                return;
            }
            
            // Start processing tabs
            this.processNextTab();
        });
    },
    
    // Process next tab
    processNextTab: function() {
        if (!this.isRunning || this.currentTabIndex >= this.tabs.length) {
            this.isRunning = false;
            console.log(`✅ Multi-Tab Solver finished: ${this.solvedTabs} solved, ${this.failedTabs} failed`);
            
            if (this.callback) {
                this.callback({
                    action: 'finished',
                    solved: this.solvedTabs,
                    failed: this.failedTabs
                });
            }
            return;
        }
        
        const tab = this.tabs[this.currentTabIndex];
        console.log(`🔍 Processing tab ${this.currentTabIndex + 1}/${this.tabs.length}: ${tab.url}`);
        
        // Focus on the tab
        chrome.tabs.update(tab.id, {active: true}, () => {
            // Wait for tab to be focused
            setTimeout(() => {
                // Send message to solve on this tab
                chrome.tabs.sendMessage(tab.id, {action: 'startAutoTest'}, (response) => {
                    if (response && response.success) {
                        console.log(`✅ Tab ${this.currentTabIndex + 1} solved successfully`);
                        this.solvedTabs++;
                    } else {
                        console.log(`❌ Tab ${this.currentTabIndex + 1} failed to solve`);
                        this.failedTabs++;
                    }
                    
                    // Move to next tab
                    this.currentTabIndex++;
                    
                    // Small delay before next tab
                    setTimeout(() => this.processNextTab(), 2000);
                });
            }, 1000);
        });
    },
    
    // Get current tab
    getCurrentTab: function() {
        return new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                resolve(tabs[0] || null);
            });
        });
    },
    
    // Move to next tab
    moveToNextTab: function() {
        this.getCurrentTab().then(currentTab => {
            if (!currentTab) return;
            
            chrome.tabs.query({}, (tabs) => {
                const currentIndex = tabs.findIndex(t => t.id === currentTab.id);
                if (currentIndex === -1 || currentIndex >= tabs.length - 1) return;
                
                const nextTab = tabs[currentIndex + 1];
                chrome.tabs.update(nextTab.id, {active: true});
            });
        });
    },
    
    // Move to previous tab
    moveToPreviousTab: function() {
        this.getCurrentTab().then(currentTab => {
            if (!currentTab) return;
            
            chrome.tabs.query({}, (tabs) => {
                const currentIndex = tabs.findIndex(t => t.id === currentTab.id);
                if (currentIndex <= 0) return;
                
                const prevTab = tabs[currentIndex - 1];
                chrome.tabs.update(prevTab.id, {active: true});
            });
        });
    },
    
    // Get stats
    getStats: function() {
        return {
            isRunning: this.isRunning,
            currentTab: this.currentTabIndex,
            totalTabs: this.tabs.length,
            solvedTabs: this.solvedTabs,
            failedTabs: this.failedTabs
        };
    },
    
    // Solve on current tab only
    solveCurrentTab: function() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'startAutoTest'});
            }
        });
    },
    
    // Solve on all tabs
    solveAllTabs: function(callback) {
        this.start(callback);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.MultiTabSolver = MultiTabSolver;
}
