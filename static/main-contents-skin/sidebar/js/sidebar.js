// Apple macOS/iOS 스타일 사이드바 JavaScript

class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.widgets = new Map();
        this.isVisible = true;

        this.init();
    }

    init() {
        this.sidebar = document.querySelector('.sidebar');
        if (!this.sidebar) return;

        this.setupWidgets();
        this.setupDragAndDrop();
        this.setupResponsive();
        this.loadWidgetStates();
    }

    setupWidgets() {
        const widgets = this.sidebar.querySelectorAll('section');

        widgets.forEach(widget => {
            const widgetId = widget.id || `widget-${Date.now()}`;
            widget.id = widgetId;

            this.widgets.set(widgetId, {
                element: widget,
                collapsed: false,
                order: Array.from(widgets).indexOf(widget)
            });

            this.setupWidgetControls(widget);
        });
    }

    setupWidgetControls(widget) {
        const header = widget.querySelector('.sidebar-widget-header');
        if (!header) return;

        // 토글 버튼 추가
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-widget-toggle';
        toggleBtn.innerHTML = '▼';
        toggleBtn.addEventListener('click', () => {
            this.toggleWidget(widget.id);
        });

        header.appendChild(toggleBtn);
    }

    toggleWidget(widgetId) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return;

        const content = widget.element.querySelector('.sidebar-widget-content');
        const toggle = widget.element.querySelector('.sidebar-widget-toggle');

        widget.collapsed = !widget.collapsed;

        if (widget.collapsed) {
            widget.element.classList.add('collapsed');
            toggle.innerHTML = '▶';
            content.style.display = 'none';
        } else {
            widget.element.classList.remove('collapsed');
            toggle.innerHTML = '▼';
            content.style.display = '';
        }

        this.saveWidgetStates();
    }

    setupDragAndDrop() {
        const widgets = this.sidebar.querySelectorAll('.sidebar-widget');

        widgets.forEach(widget => {
            widget.draggable = true;

            widget.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', widget.id);
                widget.classList.add('dragging');
            });

            widget.addEventListener('dragend', () => {
                widget.classList.remove('dragging');
            });

            widget.addEventListener('dragover', (e) => {
                e.preventDefault();
                widget.classList.add('drop-target');
            });

            widget.addEventListener('dragleave', () => {
                widget.classList.remove('drop-target');
            });

            widget.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                const draggedWidget = document.getElementById(draggedId);

                if (draggedWidget && draggedWidget !== widget) {
                    this.reorderWidgets(draggedWidget, widget);
                }

                widget.classList.remove('drop-target');
            });
        });
    }

    reorderWidgets(draggedWidget, targetWidget) {
        const container = this.sidebar.querySelector('.sidebar-container');
        const widgets = Array.from(container.children);

        const draggedIndex = widgets.indexOf(draggedWidget);
        const targetIndex = widgets.indexOf(targetWidget);

        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedWidget, targetWidget.nextSibling);
        } else {
            container.insertBefore(draggedWidget, targetWidget);
        }

        this.updateWidgetOrder();
    }

    updateWidgetOrder() {
        const widgets = this.sidebar.querySelectorAll('.sidebar-widget');

        widgets.forEach((widget, index) => {
            const widgetData = this.widgets.get(widget.id);
            if (widgetData) {
                widgetData.order = index;
            }
        });

        this.saveWidgetStates();
    }

    setupResponsive() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const handleMediaChange = (e) => {
            if (e.matches) {
                this.setupMobileOverlay();
            } else {
                this.removeMobileOverlay();
            }
        };

        mediaQuery.addEventListener('change', handleMediaChange);
        handleMediaChange(mediaQuery);
    }

    setupMobileOverlay() {
        let overlay = document.querySelector('.sidebar-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        overlay.addEventListener('click', () => {
            this.hideMobile();
        });
    }

    removeMobileOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showMobile() {
        this.sidebar.classList.add('active');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideMobile() {
        this.sidebar.classList.remove('active');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    saveWidgetStates() {
        const states = {};

        this.widgets.forEach((widget, id) => {
            states[id] = {
                collapsed: widget.collapsed,
                order: widget.order
            };
        });

        Utils.storage.set('sidebarWidgetStates', states);
    }

    loadWidgetStates() {
        const states = Utils.storage.get('sidebarWidgetStates');
        if (!states) return;

        Object.entries(states).forEach(([id, state]) => {
            const widget = this.widgets.get(id);
            if (widget) {
                if (state.collapsed) {
                    this.toggleWidget(id);
                }
                widget.order = state.order;
            }
        });

        // 위젯 순서 정렬
        this.sortWidgetsByOrder();
    }

    sortWidgetsByOrder() {
        const container = this.sidebar.querySelector('.sidebar-container');
        const widgets = Array.from(container.children);

        widgets.sort((a, b) => {
            const aOrder = this.widgets.get(a.id)?.order || 0;
            const bOrder = this.widgets.get(b.id)?.order || 0;
            return aOrder - bOrder;
        });

        widgets.forEach(widget => {
            container.appendChild(widget);
        });
    }

    // 위젯 데이터 업데이트
    updateWidgetData(widgetId, data) {
        const widget = this.widgets.get(widgetId);
        if (!widget) return;

        const content = widget.element.querySelector('.sidebar-widget-content');
        if (content) {
            this.renderWidgetContent(widgetId, data, content);
        }
    }

    renderWidgetContent(widgetId, data, container) {
        switch (widgetId) {
            case 'recent-activity':
                this.renderActivityWidget(data, container);
                break;
            case 'trending':
                this.renderTrendingWidget(data, container);
                break;
            case 'users':
                this.renderUsersWidget(data, container);
                break;
            case 'stats':
                this.renderStatsWidget(data, container);
                break;
            case 'calendar':
                this.renderCalendarWidget(data, container);
                break;
        }
    }

    renderActivityWidget(activities, container) {
        const html = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${Utils.timeAgo(activity.time)}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class="activity-list">${html}</div>`;
    }

    renderTrendingWidget(trends, container) {
        const html = trends.map((trend, index) => `
            <div class="trending-item">
                <div class="trending-rank ${index < 3 ? 'top' : ''}">${index + 1}</div>
                <div class="trending-content">
                    <div class="trending-title">${trend.title}</div>
                    <div class="trending-stats">${trend.stats}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class="trending-list">${html}</div>`;
    }

    renderUsersWidget(users, container) {
        const html = users.map(user => `
            <div class="user-item">
                <div class="user-avatar">${user.name.charAt(0)}</div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-role">${user.role}</div>
                </div>
                <button class="user-follow ${user.following ? 'following' : ''}">
                    ${user.following ? '팔로잉' : '팔로우'}
                </button>
            </div>
        `).join('');

        container.innerHTML = `<div class="users-list">${html}</div>`;
    }

    renderStatsWidget(stats, container) {
        const html = stats.map(stat => `
            <div class="stat-item">
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        container.innerHTML = `<div class="stats-grid">${html}</div>`;
    }

    renderCalendarWidget(calendarData, container) {
        const { month, year, days } = calendarData;

        const daysHtml = days.map(day => `
            <div class="calendar-day ${day.class || ''}">${day.number}</div>
        `).join('');

        container.innerHTML = `
            <div class="calendar">
                <div class="calendar-header">
                    <div class="calendar-month">${month} ${year}</div>
                    <div class="calendar-nav">
                        <button class="calendar-nav-btn" data-action="prev">‹</button>
                        <button class="calendar-nav-btn" data-action="next">›</button>
                    </div>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-day header">일</div>
                    <div class="calendar-day header">월</div>
                    <div class="calendar-day header">화</div>
                    <div class="calendar-day header">수</div>
                    <div class="calendar-day header">목</div>
                    <div class="calendar-day header">금</div>
                    <div class="calendar-day header">토</div>
                    ${daysHtml}
                </div>
            </div>
        `;
    }

    getActivityIcon(type) {
        const icons = {
            comment: '💬',
            like: '👍',
            share: '📤',
            follow: '👤',
            post: '📝'
        };
        return icons[type] || '📄';
    }
}

// 사이드바 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});

// 전역 사이드바 API
window.Sidebar = {
    updateWidget: (widgetId, data) => {
        if (window.sidebarManager) {
            window.sidebarManager.updateWidgetData(widgetId, data);
        }
    },

    toggleWidget: (widgetId) => {
        if (window.sidebarManager) {
            window.sidebarManager.toggleWidget(widgetId);
        }
    },

    showMobile: () => {
        if (window.sidebarManager) {
            window.sidebarManager.showMobile();
        }
    },

    hideMobile: () => {
        if (window.sidebarManager) {
            window.sidebarManager.hideMobile();
        }
    }
};