let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let editingEventId = null;
let isAdmin = false;
let allEventsData = [];

document.addEventListener('DOMContentLoaded', function() {
    isAdmin = document.body.dataset.userRole === 'admin';
    generateCalendar(currentMonth, currentYear);
    attachCalendarListeners();
    attachViewToggleListeners();
});

function generateCalendar(month, year) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthYearTitle = document.querySelector('.calendar-title');
    
    if (!calendarGrid || !monthYearTitle) return;
    
    monthYearTitle.textContent = new Date(year, month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendarHTML = '';
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day other-month"></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-events"></div>
                <div class="event-count"></div>
            </div>
        `;
    }
    
    calendarGrid.innerHTML = calendarHTML;
    loadEventsForMonth(month, year);
    attachCalendarListeners();
}

function loadEventsForMonth(month, year) {
    fetch(`../get_events.php?month=${month}&year=${year}`)
        .then(response => response.json())
        .then(events => {
            document.querySelectorAll('.calendar-events').forEach(el => el.innerHTML = '');
            document.querySelectorAll('.event-count').forEach(el => el.innerHTML = '');
            
            const eventsByDate = {};
            events.forEach(event => {
                if (!eventsByDate[event.reservation_date]) {
                    eventsByDate[event.reservation_date] = [];
                }
                eventsByDate[event.reservation_date].push(event);
            });
            
            Object.keys(eventsByDate).forEach(dateStr => {
                const container = document.querySelector(`[data-date="${dateStr}"] .calendar-events`);
                const countEl = document.querySelector(`[data-date="${dateStr}"] .event-count`);
                
                if (container) {
                    eventsByDate[dateStr].slice(0, 3).forEach(event => {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event-item';
                        eventDiv.textContent = event.event_name.substring(0, 12) + (event.event_name.length > 12 ? '...' : '');
                        eventDiv.title = event.event_name + ' (' + event.event_time + ')';
                        container.appendChild(eventDiv);
                    });
                    
                    if (eventsByDate[dateStr].length > 3) {
                        const moreDiv = document.createElement('div');
                        moreDiv.className = 'event-item';
                        moreDiv.textContent = `+${eventsByDate[dateStr].length - 3} more`;
                        moreDiv.style.background = '#ff9800';
                        moreDiv.style.color = 'white';
                        container.appendChild(moreDiv);
                    }
                }
                
                if (countEl) {
                    const count = eventsByDate[dateStr].length;
                    countEl.textContent = count + (count === 1 ? ' event' : ' events');
                    countEl.style.color = count >= 5 ? '#dc3545' : '#28a745';
                }
            });
        });
}

function attachCalendarListeners() {
    document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
        day.style.cursor = 'pointer';
        day.onclick = function() {
            selectedDate = this.dataset.date;
            showEventModal(selectedDate);
        };
    });
    
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    if (prevBtn) prevBtn.onclick = () => navigateMonth(-1);
    if (nextBtn) nextBtn.onclick = () => navigateMonth(1);
}

function navigateMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    generateCalendar(currentMonth, currentYear);
}

function showEventModal(date) {
    selectedDate = date;
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const dateObj = new Date(date);
    modalTitle.textContent = '';
    
    modalBody.innerHTML = '<div style="text-align:center;padding:40px;color:#666;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><br>Loading events...</div>';
    modal.style.display = 'block';
    
    fetch(`../get_events.php?date=${date}`)
        .then(response => response.json())
        .then(events => {
            let content = '<div class="event-list">';
            
            if (events.length === 0) {
                content += '<p style="text-align:center;color:#666;padding:40px 20px;font-size:18px;">No events scheduled<br><small></small></p>';
            } else {
                events.forEach(event => {
                    content += `
                        <div class="event-card" style="position:relative;">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4 style="margin:0 0 10px 0;color:#2c3e50;">${event.event_name}</h4>
                                    <div style="font-size:14px;color:#666;line-height:1.6;">
                                        <div><i class="fas fa-building" style="color:#667eea;"></i> ${event.department}</div>
                                        <div><i class="fas fa-map-marker-alt" style="color:#667eea;"></i> ${event.venue}</div>
                                        <div><i class="fas fa-clock" style="color:#667eea;"></i> ${event.event_time}</div>
                                        ${event.equipment ? `<div><i class="fas fa-tools" style="color:#667eea;"></i> ${event.equipment}</div>` : ''}
                                    </div>
                                </div>
                                ${isAdmin ? `
                                    <div style="margin-left:10px;white-space:nowrap;">
                                        <button class="btn btn-primary" onclick="editEvent(${event.id})" title="Edit">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-danger" onclick="deleteEvent(${event.id}, '${date}')" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
            }
            
            content += '</div>';
            
            if (isAdmin) {
                content += `
                    <div style="text-align:center;margin-top:25px;padding-top:25px;border-top:2px solid #eee;">
                        <button class="btn btn-primary" onclick="showAddEventModal()" style="font-size:18px;padding:15px 30px;">
                            <i class="fas fa-plus-circle"></i> Add New Event
                        </button>
                    </div>
                `;
            }
            
            modalBody.innerHTML = content;
        });
}

function showAddEventModal() {
    editingEventId = null;
    const modal = document.getElementById('eventModal');
    const modalContent = document.querySelector('.modal-content');
    modal.style.display = 'block';
    
    if (!selectedDate) {
        modalContent.innerHTML = createEventFormWithDate('Add New Event');
    } else {
        modalContent.innerHTML = createEventForm('Add New Event', selectedDate);
    }
}

function showEditEventModal(eventId) {
    editingEventId = eventId;
    const modal = document.getElementById('eventModal');
    modal.style.display = 'block';
    const modalContent = document.querySelector('.modal-content');
    
    modalContent.innerHTML = '<div style="text-align:center;padding:40px;color:#666;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><br>Loading...</div>';
    
    fetch(`../get_events.php?single=${eventId}`)
        .then(r => r.json())
        .then(event => {
            if (event.id) {
                modalContent.innerHTML = createEventFormWithDate('Edit Event', event);
            }
        });
}

function createEventForm(title, date, eventData = null) {
    const isEdit = eventData !== null;
    const action = isEdit ? 'edit' : 'add';
    const btnText = isEdit ? 'Update Event' : 'Save Event';
    
    let equipment = '', eventName = '', department = '', venue = '', eventTime = '';
    
    if (isEdit) {
        eventName = eventData.event_name;
        department = eventData.department;
        venue = eventData.venue;
        eventTime = eventData.event_time;
        equipment = eventData.equipment || '';
    }
    
    const departments = ['Tourism Management', 'Information Technology', 'Nursing', 'Criminology', 'Accountancy', 'Hospitality Management', 'Psychology', 'Radiologic Technology', 'Business Administration', 'Communication'];
    const venues = ['Auditorium', 'Audio-Visual Room (AVR)', 'Conference', 'Gymnasium', 'Olivarez Coliseum', 'Quadrangle', 'Botanical', 'Resort', 'MMR'];
    
    return `
        <div class="modal-header">
            <h3><i class="fas fa-${isEdit ? 'edit' : 'plus'}-circle"></i> ${title}</h3>
            <p style="margin-top:5px;opacity:0.8;font-size:14px;">${new Date(date).toLocaleDateString('en-US')}</p>
        </div>
        <div class="modal-body">
            <form id="eventForm">
                <input type="hidden" name="action" value="${action}">
                <input type="hidden" name="date" value="${date}">
                ${isEdit ? `<input type="hidden" name="id" value="${eventData.id}">` : ''}
                
                <div class="form-group-modal">
                    <label>Event Name <span style="color:red;">*</span></label>
                    <input type="text" name="event_name" value="${eventName}" required maxlength="200">
                </div>
                
                <div class="form-group-modal">
                    <label>Department <span style="color:red;">*</span></label>
                    <input list="dept-list" name="department" value="${department}" required placeholder="Select or type department...">
                    <datalist id="dept-list">
                        ${departments.map(dept => `<option value="${dept}"></option>`).join('')}
                    </datalist>
                </div>
                
                <div class="form-group-modal">
                    <label>Venue <span style="color:red;">*</span></label>
                    <input list="venue-list" name="venue" value="${venue}" required placeholder="Select or type venue...">
                    <datalist id="venue-list">
                        ${venues.map(ven => `<option value="${ven}"></option>`).join('')}
                    </datalist>
                </div>
                
                <div class="form-group-modal">
                    <label>Event Time <span style="color:red;">*</span></label>
                    <input type="text" name="event_time" value="${eventTime}" required">
                </div>
                
                <div class="form-group-modal">
                    <label>Equipment Needed</label>
                    <textarea name="equipment" rows="3" maxlength="500">${equipment}</textarea>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEvent()" style="font-weight:bold;">
                <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${btnText}
            </button>
        </div>
    `;
}

function createEventFormWithDate(title, eventData = null) {
    const isEdit = eventData !== null;
    const action = isEdit ? 'edit' : 'add';
    const btnText = isEdit ? 'Update Event' : 'Save Event';
    
    let equipment = '', eventName = '', department = '', venue = '', eventTime = '', eventDate = '';
    
    if (isEdit) {
        eventName = eventData.event_name;
        department = eventData.department;
        venue = eventData.venue;
        eventTime = eventData.event_time;
        equipment = eventData.equipment || '';
        eventDate = eventData.reservation_date;
    } else {
        eventDate = new Date().toISOString().split('T')[0];
    }
    
    const departments = ['Tourism Management', 'Information Technology', 'Nursing', 'Criminology', 'Accountancy', 'Hospitality Management', 'Psychology', 'Radiologic Technology', 'Business Administration', 'Communication'];
    const venues = ['Auditorium', 'Audio-Visual Room (AVR)', 'Conference', 'Gymnasium', 'Olivarez Coliseum', 'Quadrangle', 'Botanical', 'Resort', 'MMR'];
    
    return `
        <div class="modal-header">
            <h3><i class="fas fa-${isEdit ? 'edit' : 'plus'}-circle"></i> ${title}</h3>
        </div>
        <div class="modal-body">
            <form id="eventForm">
                <input type="hidden" name="action" value="${action}">
                ${isEdit ? `<input type="hidden" name="id" value="${eventData.id}">` : ''}
                
                <div class="form-group-modal">
                    <label>Event Date <span style="color:red;">*</span></label>
                    <input type="date" name="date" value="${eventDate}" required">
                </div>
                
                <div class="form-group-modal">
                    <label>Event Name <span style="color:red;">*</span></label>
                    <input type="text" name="event_name" value="${eventName}" required maxlength="200">
                </div>
                
                <div class="form-group-modal">
                    <label>Department <span style="color:red;">*</span></label>
                    <input list="dept-list" name="department" value="${department}" required placeholder="Select or type department...">
                    <datalist id="dept-list">
                        ${departments.map(dept => `<option value="${dept}"></option>`).join('')}
                    </datalist>
                </div>
                
                <div class="form-group-modal">
                    <label>Venue <span style="color:red;">*</span></label>
                    <input list="venue-list" name="venue" value="${venue}" required placeholder="Select or type venue...">
                    <datalist id="venue-list">
                        ${venues.map(ven => `<option value="${ven}"></option>`).join('')}
                    </datalist>
                </div>
                
                <div class="form-group-modal">
                    <label>Event Time <span style="color:red;">*</span></label>
                    <input type="text" name="event_time" value="${eventTime}" required">
                </div>
                
                <div class="form-group-modal">
                    <label>Equipment Needed</label>
                    <textarea name="equipment" rows="3" maxlength="500">${equipment}</textarea>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="submitEvent()" style="font-weight:bold;">
                <i class="fas fa-${isEdit ? 'save' : 'plus'}"></i> ${btnText}
            </button>
        </div>
    `;
}

function editEvent(eventId) {
    showEditEventModal(eventId);
}

// SUBMIT EVENT WITH VALIDATION
function submitEvent() {
    const form = document.getElementById('eventForm');
    const eventName = form.event_name.value.trim();
    const department = form.department.value.trim();
    const venue = form.venue.value.trim();
    const eventTime = form.event_time.value.trim();
    const eventDate = form.date ? form.date.value.trim() : selectedDate;
    
    // VALIDATION - Check all required fields
    if (!eventDate) {
        showToast('Event Date is required!', 'error');
        if (form.date) form.date.focus();
        return;
    }
    if (!eventName) {
        showToast('Event Name is required!', 'error');
        form.event_name.focus();
        return;
    }
    if (!department) {
        showToast('Department is required!', 'error');
        form.department.focus();
        return;
    }
    if (!venue) {
        showToast('Venue is required!', 'error');
        form.venue.focus();
        return;
    }
    if (!eventTime) {
        showToast('Event Time is required!', 'error');
        form.event_time.focus();
        return;
    }
    
    const formData = new FormData(form);
    
    const saveBtn = event.target;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    fetch(`../save_event.php`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
.then(data => {
             saveBtn.innerHTML = originalText;
             saveBtn.disabled = false;
             
             if (data.success) {
                 generateCalendar(currentMonth, currentYear);
                 closeModal();
                 if (document.getElementById('list-view-container').style.display === 'block') {
                     loadAllEvents();
                 }
                 showToast(` ${data.message}`, 'success');
             } else {
                 showToast(` ${data.message}`, 'error');
             }
         })
    .catch(error => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        showToast('Connection error', 'error');
    });
}

// DELETE + AUTO REFRESH
function deleteEvent(eventId, date) {
    if (confirm('Delete this event permanently?')) {
        const delBtn = event.target;
        const originalText = delBtn.innerHTML;
        delBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        delBtn.disabled = true;
        
        fetch(`../save_event.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=delete&id=${eventId}`
        })
        .then(r => r.json())
        .then(data => {
            delBtn.innerHTML = originalText;
            delBtn.disabled = false;
            
            if (data.success) {
                generateCalendar(currentMonth, currentYear);
                closeModal();
                if (document.getElementById('list-view-container').style.display === 'block') {
                    loadAllEvents();
                }
                showToast('✅ Event deleted!', 'success');
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        });
    }
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed;top:20px;right:20px;z-index:9999;
        padding:15px 20px;border-radius:8px;font-weight:500;
        color:white;min-width:300px;box-shadow:0 10px 25px rgba(0,0,0,0.2);
        transform:translateX(400px);transition:all 0.3s ease;
        background:${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="margin-right:10px;"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    editingEventId = null;
}

window.onclick = function(event) {
    if (event.target.id === 'eventModal') closeModal();
}

function attachViewToggleListeners() {
    const calendarBtn = document.getElementById('calendar-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    const calendarContainer = document.querySelector('.calendar-container');
    const listContainer = document.getElementById('list-view-container');
    
    if (calendarBtn && listBtn) {
        calendarBtn.onclick = function() {
            if (!this.classList.contains('active')) {
                this.classList.add('active');
                listBtn.classList.remove('active');
                calendarContainer.style.display = 'block';
                listContainer.style.display = 'none';
            }
        };
        
        listBtn.onclick = function() {
            if (!this.classList.contains('active')) {
                this.classList.add('active');
                calendarBtn.classList.remove('active');
                calendarContainer.style.display = 'none';
                listContainer.style.display = 'block';
                loadAllEvents();
            }
        };
    }
}

function loadAllEvents() {
    const eventsList = document.getElementById('events-list');
    
    eventsList.innerHTML = '<div style="text-align:center;padding:40px;color:#666;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><br>Loading events...</div>';
    
    fetch(`../get_events.php?all=1`)
        .then(response => response.json())
        .then(events => {
            allEventsData = events;
            populateMonthFilter(events);
            renderEventsList(events);
            attachSearchListener();
        })
        .catch(() => {
            eventsList.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Error loading events</p>';
        });
}

function populateMonthFilter(events) {
    const listFilter = document.getElementById('list-filter');
    if (!listFilter) return;
    
    const months = {};
    events.forEach(event => {
        const monthYear = event.reservation_date.substring(0, 7);
        if (!months[monthYear]) {
            const [y, m] = monthYear.split('-');
            months[monthYear] = new Date(y, m - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        }
    });
    
    let options = '<option value="">All Months</option>';
    Object.keys(months).sort().forEach(key => {
        options += `<option value="${key}">${months[key]}</option>`;
    });
    listFilter.innerHTML = options;
}

function renderEventsList(events, filteredEvents = null) {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';
    
    const eventsToShow = filteredEvents || events;
    
    if (eventsToShow.length === 0) {
        eventsList.innerHTML = '<p style="text-align:center;color:#666;padding:40px;font-size:18px;">No events found</p>';
        return;
    }
    
    eventsToShow.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'list-event-card';
        eventDiv.dataset.eventId = event.id;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'list-event-details';
        detailsDiv.innerHTML = `
            <div><i class="fas fa-calendar" style="color:#667eea;"></i> ${formatDate(event.reservation_date)}</div>
            <div><i class="fas fa-clock" style="color:#667eea;"></i> ${event.event_time}</div>
            <div><i class="fas fa-building" style="color:#667eea;"></i> ${event.department}</div>
            <div><i class="fas fa-map-marker-alt" style="color:#667eea;"></i> ${event.venue}</div>
            ${event.equipment ? `<div><i class="fas fa-tools" style="color:#667eea;"></i> ${event.equipment}</div>` : ''}
        `;
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'list-event-title';
        titleDiv.textContent = event.event_name;
        
        const flexDiv = document.createElement('div');
        flexDiv.style.display = 'flex';
        flexDiv.style.justifyContent = 'space-between';
        flexDiv.style.alignItems = 'flex-start';
        
        const contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';
        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(detailsDiv);
        
        flexDiv.appendChild(contentDiv);
        
        if (isAdmin) {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'list-event-controls';
            controlsDiv.innerHTML = `
                <button class="btn btn-primary" onclick="editEvent(${event.id})" title="Edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id}, '${event.reservation_date}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            flexDiv.appendChild(controlsDiv);
        }
        
        eventDiv.appendChild(flexDiv);
        eventsList.appendChild(eventDiv);
    });
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function attachSearchListener() {
    const searchInput = document.getElementById('list-search');
    const listFilter = document.getElementById('list-filter');
    
    if (searchInput) {
        searchInput.oninput = function() {
            applyFilters();
        };
    }
    
    if (listFilter) {
        listFilter.onchange = function() {
            applyFilters();
        };
    }
}

function applyFilters() {
    const searchInput = document.getElementById('list-search');
    const listFilter = document.getElementById('list-filter');
    
    if (!searchInput || !listFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedMonth = listFilter.value;
    
    const filtered = allEventsData.filter(event => {
        const matchesSearch = event.event_name.toLowerCase().includes(searchTerm) ||
                            event.department.toLowerCase().includes(searchTerm) ||
                            event.venue.toLowerCase().includes(searchTerm);
        const matchesMonth = !selectedMonth || event.reservation_date.startsWith(selectedMonth);
        return matchesSearch && matchesMonth;
    });
    
    renderEventsList(allEventsData, filtered);
}