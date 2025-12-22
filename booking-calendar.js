class BookingCalendar {
    constructor(elementId, options = {}) {
        this.container = document.getElementById(elementId);
        if (!this.container) {
            console.error(`Element with id "${elementId}" not found`);
            return;
        }

        // Configuration
        this.config = {
            availableTimeSlots: options.availableTimeSlots || [
                '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
                '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
            ],
            bookedAppointments: options.bookedAppointments || [],
            onSelectDateTime: options.onSelectDateTime || null,
            autoSelectNext: options.autoSelectNext !== false, // default true
            currentDateTime: options.currentDateTime || new Date()
        };

        // State
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);

        this.state = {
            currentMonth: this.today.getMonth(),
            currentYear: this.today.getFullYear(),
            selectedDay: null,
            selectedMonth: null,
            selectedYear: null,
            selectedTime: null
        };

        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        this.init();
    }

    init() {
        this.render();
        if (this.config.autoSelectNext) {
            this.selectNextAvailableSlot();
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    parseTime(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }

    getBookedTimesForDate(year, month, day) {
        const dateStr = this.formatDate(year, month, day);
        return this.config.bookedAppointments
            .filter(apt => apt.startsWith(dateStr))
            .map(apt => apt.split(' ').slice(1).join(' '));
    }

    isDateFullyBooked(year, month, day) {
        const bookedTimes = this.getBookedTimesForDate(year, month, day);
        return bookedTimes.length === this.config.availableTimeSlots.length;
    }

    getAvailableSlotsCount(year, month, day) {
        const bookedTimes = this.getBookedTimesForDate(year, month, day);
        return this.config.availableTimeSlots.length - bookedTimes.length;
    }

    isDateInPast(year, month, day) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        return date < this.today;
    }

    getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    getFirstDayOfMonth(month, year) {
        return new Date(year, month, 1).getDay();
    }

    getAvailableTimesForDate(year, month, day) {
        const bookedTimes = this.getBookedTimesForDate(year, month, day);
        return this.config.availableTimeSlots.filter(time => !bookedTimes.includes(time));
    }

    selectNextAvailableSlot() {
        const now = this.config.currentDateTime;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let searchDate = new Date(now);
        searchDate.setHours(0, 0, 0, 0);

        // Search for the next 90 days
        for (let i = 0; i < 90; i++) {
            const year = searchDate.getFullYear();
            const month = searchDate.getMonth();
            const day = searchDate.getDate();

            if (this.isDateInPast(year, month, day)) {
                searchDate.setDate(searchDate.getDate() + 1);
                continue;
            }

            if (this.isDateFullyBooked(year, month, day)) {
                searchDate.setDate(searchDate.getDate() + 1);
                continue;
            }

            const availableTimes = this.getAvailableTimesForDate(year, month, day);

            // If it's today, filter out past times
            let validTimes = availableTimes;
            if (i === 0) {
                validTimes = availableTimes.filter(time => this.parseTime(time) > currentMinutes);
            }

            if (validTimes.length > 0) {
                // Found next available slot
                this.state.selectedDay = day;
                this.state.selectedMonth = month;
                this.state.selectedYear = year;
                this.state.selectedTime = validTimes[0];
                this.state.currentMonth = month;
                this.state.currentYear = year;

                this.renderCalendar();
                this.renderTimeSlots();
                this.updateSelectedDate();

                if (this.config.onSelectDateTime) {
                    this.config.onSelectDateTime(this.getSelectedDateTime());
                }

                return;
            }

            searchDate.setDate(searchDate.getDate() + 1);
        }

        // No available slots found in next 90 days
        console.log('No available slots found in the next 90 days');
    }

    // ============================================
    // RENDER METHODS
    // ============================================

    render() {
        this.container.innerHTML = `
          <div class="calendar-container">
            <div class="calendar-section">
              <div class="calendar-header">
                <button id="prevMonth">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <span id="monthYear"></span>
                <button id="nextMonth">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <div class="weekdays">
                <div class="weekday">Su</div>
                <div class="weekday">Mo</div>
                <div class="weekday">Tu</div>
                <div class="weekday">We</div>
                <div class="weekday">Th</div>
                <div class="weekday">Fr</div>
                <div class="weekday">Sa</div>
              </div>
              <div id="daysGrid" class="days-grid"></div>
              <div class="legend">
                <div class="legend-item">
                  <div class="legend-dot selected"></div>
                  <span>Selected</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot available"></div>
                  <span>Available</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot booked"></div>
                  <span>Fully Booked</span>
                </div>
              </div>
            </div>
            <div class="time-section">
              <div class="time-header">
                <p id="selectedDateText">Select a date</p>
                <p id="spotsLeft"></p>
              </div>
              <div class="time-slots" id="timeSlots"></div>
            </div>
          </div>
        `;

        this.attachEventListeners();
        this.renderCalendar();
        this.renderTimeSlots();
    }

    attachEventListeners() {
        this.container.querySelector('#prevMonth').addEventListener('click', () => this.changeMonth(-1));
        this.container.querySelector('#nextMonth').addEventListener('click', () => this.changeMonth(1));
    }

    renderCalendar() {
        const daysGrid = this.container.querySelector('#daysGrid');
        const monthYear = this.container.querySelector('#monthYear');

        monthYear.textContent = `${this.monthNames[this.state.currentMonth]} ${this.state.currentYear}`;

        const daysInMonth = this.getDaysInMonth(this.state.currentMonth, this.state.currentYear);
        const firstDay = this.getFirstDayOfMonth(this.state.currentMonth, this.state.currentYear);

        daysGrid.innerHTML = '';

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            daysGrid.appendChild(emptyDay);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.className = 'day';
            dayBtn.textContent = day;

            const isPast = this.isDateInPast(this.state.currentYear, this.state.currentMonth, day);
            const isFullyBooked = this.isDateFullyBooked(this.state.currentYear, this.state.currentMonth, day);
            const isSelected = day === this.state.selectedDay &&
                this.state.currentMonth === this.state.selectedMonth &&
                this.state.currentYear === this.state.selectedYear;

            if (isPast) {
                dayBtn.className += ' past';
                dayBtn.disabled = true;
            } else if (isFullyBooked) {
                dayBtn.className += ' fully-booked';
                dayBtn.disabled = true;
                dayBtn.title = 'Fully Booked';
            } else {
                dayBtn.className += ' available';
                if (isSelected) {
                    dayBtn.className += ' selected';
                }
                dayBtn.addEventListener('click', () => this.selectDay(day));
            }

            daysGrid.appendChild(dayBtn);
        }
    }

    selectDay(day) {
        this.state.selectedDay = day;
        this.state.selectedMonth = this.state.currentMonth;
        this.state.selectedYear = this.state.currentYear;
        this.state.selectedTime = null;
        this.renderCalendar();
        this.renderTimeSlots();
        this.updateSelectedDate();
    }

    updateSelectedDate() {
        const selectedDateText = this.container.querySelector('#selectedDateText');
        const spotsLeft = this.container.querySelector('#spotsLeft');

        if (this.state.selectedDay === null) {
            selectedDateText.textContent = 'Select a date';
            spotsLeft.textContent = '';
            return;
        }

        const date = new Date(this.state.selectedYear, this.state.selectedMonth, this.state.selectedDay);
        const dayName = this.dayNames[date.getDay()];
        const monthName = this.monthNames[this.state.selectedMonth].substring(0, 3);

        selectedDateText.textContent = `${dayName}, ${monthName} ${this.state.selectedDay}`;

        const availableSlots = this.getAvailableSlotsCount(this.state.selectedYear, this.state.selectedMonth, this.state.selectedDay);
        spotsLeft.textContent = `${availableSlots} spot${availableSlots !== 1 ? 's' : ''} left`;
    }

    renderTimeSlots() {
        const timeSlotsContainer = this.container.querySelector('#timeSlots');
        timeSlotsContainer.innerHTML = '';

        if (this.state.selectedDay === null) {
            const message = document.createElement('p');
            message.style.textAlign = 'center';
            message.style.color = '#9ca3af';
            message.style.fontSize = '12px';
            message.style.marginTop = '20px';
            message.textContent = 'Please select a date';
            timeSlotsContainer.appendChild(message);
            return;
        }

        const bookedTimes = this.getBookedTimesForDate(this.state.selectedYear, this.state.selectedMonth, this.state.selectedDay);

        const morningSlots = this.config.availableTimeSlots.filter(time => time.includes('AM'));
        const afternoonSlots = this.config.availableTimeSlots.filter(time => time.includes('PM'));

        if (morningSlots.length > 0) {
            const morningLabel = document.createElement('p');
            morningLabel.className = 'time-category';
            morningLabel.textContent = 'Morning';
            timeSlotsContainer.appendChild(morningLabel);

            morningSlots.forEach(time => {
                const btn = this.createTimeSlotButton(time, bookedTimes.includes(time));
                timeSlotsContainer.appendChild(btn);
            });
        }

        if (afternoonSlots.length > 0) {
            const afternoonLabel = document.createElement('p');
            afternoonLabel.className = 'time-category';
            afternoonLabel.textContent = 'Afternoon';
            timeSlotsContainer.appendChild(afternoonLabel);

            afternoonSlots.forEach(time => {
                const btn = this.createTimeSlotButton(time, bookedTimes.includes(time));
                timeSlotsContainer.appendChild(btn);
            });
        }
    }

    createTimeSlotButton(time, isBooked) {
        const btn = document.createElement('button');
        btn.className = 'time-slot';
        btn.textContent = time;

        if (isBooked) {
            btn.className += ' booked';
            btn.disabled = true;
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.textContent = 'lock';
            btn.appendChild(icon);
        } else {
            btn.className += ' available';
            if (time === this.state.selectedTime) {
                btn.className += ' selected';
                const icon = document.createElement('span');
                icon.className = 'material-symbols-outlined';
                icon.textContent = 'check';
                btn.appendChild(icon);
            }
            btn.addEventListener('click', () => this.selectTime(time));
        }

        return btn;
    }

    selectTime(time) {
        this.state.selectedTime = time;
        this.renderTimeSlots();

        if (this.config.onSelectDateTime) {
            this.config.onSelectDateTime(this.getSelectedDateTime());
        }
    }

    changeMonth(delta) {
        this.state.currentMonth += delta;

        if (this.state.currentMonth > 11) {
            this.state.currentMonth = 0;
            this.state.currentYear++;
        } else if (this.state.currentMonth < 0) {
            this.state.currentMonth = 11;
            this.state.currentYear--;
        }

        this.renderCalendar();
    }

    // ============================================
    // PUBLIC API
    // ============================================

    getSelectedDateTime() {
        if (!this.state.selectedDay || !this.state.selectedTime) {
            return null;
        }

        return {
            date: this.formatDate(this.state.selectedYear, this.state.selectedMonth, this.state.selectedDay),
            time: this.state.selectedTime,
            fullDateTime: `${this.formatDate(this.state.selectedYear, this.state.selectedMonth, this.state.selectedDay)} ${this.state.selectedTime}`,
            year: this.state.selectedYear,
            month: this.state.selectedMonth,
            day: this.state.selectedDay
        };
    }

    setBookedAppointments(appointments) {
        this.config.bookedAppointments = appointments;
        this.renderCalendar();
        this.renderTimeSlots();
    }

    addBookedAppointment(appointment) {
        this.config.bookedAppointments.push(appointment);
        this.renderCalendar();
        this.renderTimeSlots();
    }

    reset() {
        this.state.selectedDay = null;
        this.state.selectedMonth = null;
        this.state.selectedYear = null;
        this.state.selectedTime = null;
        this.renderCalendar();
        this.renderTimeSlots();
        this.updateSelectedDate();
    }
}

// Make it globally available
window.BookingCalendar = BookingCalendar;