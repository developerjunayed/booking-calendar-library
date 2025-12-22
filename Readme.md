Here's the corrected README.md that accurately reflects your actual calendar implementation:

# Booking Calendar Library — Usage & Demo

A lightweight, vanilla JavaScript booking calendar for selecting appointment dates and times.

## Quick Start

1. **Add HTML placeholder:**
   ```html
   <div id="bookingCalendar"></div>
   ```

2. **Include the library (inline or external):**
   ```html
   <!-- CSS -->
   <link rel="stylesheet" href="path/to/booking-calendar.css">
   <!-- Or use the CDN -->
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/developerjunayed/booking-calendar-library@v1.0.1/booking-calendar.min.css">

   <!-- JS -->
   <script src="path/to/booking-calendar.js"></script>
   <!-- Or use the CDN -->
   <script src="https://cdn.jsdelivr.net/gh/developerjunayed/booking-calendar-library@v1.0.1/booking-calendar.min.js"></script>
   ```

3. **Initialize:**
   ```javascript
   const calendar = new BookingCalendar('bookingCalendar', {
     availableTimeSlots: [
       '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
       '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
     ],
     bookedAppointments: [],
     autoSelectNext: true,
     onSelectDateTime: function(dateTime) {
       console.log('Selected:', dateTime);
     }
   });
   ```

## Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `availableTimeSlots` | `Array<string>` | Required | Available time slots (e.g., `['08:00 AM', '09:00 AM']`) |
| `bookedAppointments` | `Array<string>` | `[]` | Booked appointments in `'YYYY-MM-DD HH:MM AM/PM'` format |
| `currentDateTime` | `Date` | `new Date()` | Current date/time for determining past dates |
| `autoSelectNext` | `boolean` | `true` | Auto-select next available slot on init |
| `onSelectDateTime` | `Function` | `null` | Callback when date/time is selected |

## Features

- **Date Selection**: Click on available dates in the calendar
- **Time Selection**: Choose from available time slots
- **Auto-selection**: Automatically selects next available slot
- **Visual Status**: Clearly shows available, booked, and past dates
- **Mobile Responsive**: Works on all screen sizes

## Basic Example

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/gh/developerjunayed/booking-calendar-library@v1.0.1/booking-calendar.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/gh/developerjunayed/booking-calendar-library@v1.0.1/booking-calendar.min.js"></script>
  <style>
    /* Your custom styles here */
  </style>
</head>
<body>
  <div id="bookingCalendar"></div>
  
  <script>
    // Sample booked appointments
    const bookedAppointments = [
      '2024-12-23 08:00 AM',
      '2024-12-23 09:00 AM',
      '2024-12-25 10:00 AM'
    ];

    // Initialize
    const calendar = new BookingCalendar('bookingCalendar', {
      availableTimeSlots: [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
        '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'
      ],
      bookedAppointments: bookedAppointments,
      autoSelectNext: true,
      onSelectDateTime: function(dateTime) {
        console.log('Appointment selected:', dateTime.fullDateTime);
        // Submit to server, update form, etc.
      }
    });
  </script>
</body>
</html>
```

## API Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getSelectedDateTime()` | Get current selection | `{date, time, fullDateTime, year, month, day}` or `null` |
| `setBookedAppointments(appointments)` | Update booked appointments | `void` |
| `addBookedAppointment(appointment)` | Add single booked appointment | `void` |
| `reset()` | Clear current selection | `void` |

### Usage Examples:
```javascript
// Get current selection
const selection = calendar.getSelectedDateTime();
if (selection) {
  console.log(selection.fullDateTime); // "2024-12-23 02:30 PM"
}

// Update booked appointments
calendar.setBookedAppointments([
  '2024-12-24 08:00 AM',
  '2024-12-24 09:00 AM'
]);

// Add single appointment
calendar.addBookedAppointment('2024-12-24 10:00 AM');

// Clear selection
calendar.reset();
```

## Date/Time Format

- **Booked Appointments**: `'YYYY-MM-DD HH:MM AM/PM'` (e.g., `'2024-12-23 08:00 AM'`)
- **Time Slots**: `'HH:MM AM/PM'` (e.g., `'02:30 PM'`)
- **Selected Date Format**: Returns object with various formats

## Visual Status Indicators

- **Available Date**: Green hover effect, selectable
- **Selected Date**: Teal background with shadow
- **Fully Booked Date**: Red text, not selectable
- **Past Date**: Gray text, strikethrough, not selectable
- **Available Time Slot**: White background, selectable
- **Selected Time Slot**: Teal background with checkmark
- **Booked Time Slot**: Gray background with lock icon

## Styling & Customization

The calendar uses the following CSS classes for styling:
### You can change Calendar Primary and Background Color by overriding default CSS variables,
```css
.calendar-container { 
    --primary-color: #14b8a6; 
    --background-color: #f9fafb; 
}
```

### Calendar Dates:
- `.day` - Base day style
- `.day.available` - Available date
- `.day.selected` - Selected date
- `.day.fully-booked` - Fully booked date
- `.day.past` - Past date

### Time Slots:
- `.time-slot` - Base time slot
- `.time-slot.available` - Available time
- `.time-slot.selected` - Selected time
- `.time-slot.booked` - Booked time

### Layout:
- `.calendar-container` - Main container
- `.calendar-section` - Date picker section
- `.time-section` - Time picker section

## Event Handling

### `onSelectDateTime` Callback:
```javascript
onSelectDateTime: function(dateTime) {
  // dateTime object contains:
  // {
  //   date: "2024-12-23",
  //   time: "02:30 PM",
  //   fullDateTime: "2024-12-23 02:30 PM",
  //   year: 2024,
  //   month: 11, // 0-indexed (0=January)
  //   day: 23
  // }
  
  // Example: Update a form field
  document.getElementById('appointmentTime').value = dateTime.fullDateTime;
  
  // Example: Enable submit button
  document.getElementById('submitBtn').disabled = false;
}
```

## Advanced Example with Dynamic Updates

```javascript
// Initialize
const calendar = new BookingCalendar('bookingCalendar', {
  availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
  bookedAppointments: [],
  onSelectDateTime: updateSummary
});

// Function to handle booking
async function bookAppointment() {
  const selection = calendar.getSelectedDateTime();
  if (!selection) {
    alert('Please select a date and time');
    return;
  }
  
  try {
    // Send to server
    const response = await fetch('/api/book-appointment', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(selection)
    });
    
    if (response.ok) {
      // Add to booked appointments
      calendar.addBookedAppointment(selection.fullDateTime);
      alert('Appointment booked successfully!');
    }
  } catch (error) {
    console.error('Booking failed:', error);
  }
}

// Update summary display
function updateSummary(dateTime) {
  const summary = document.getElementById('bookingSummary');
  if (dateTime) {
    const date = new Date(dateTime.year, dateTime.month, dateTime.day);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    summary.innerHTML = `
      <h3>Appointment Summary</h3>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${dateTime.time}</p>
    `;
  }
}
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Chrome for Android 60+

## Dependencies

- Google Material Icons (for icons)
- No other external dependencies required

## License

MIT License - free for personal and commercial use.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Note**: This is a standalone implementation. The CSS and JavaScript are included inline in the example. For production use, you may want to separate them into external files.

*Thanks by [Junayed@devjoo](https://fiverr.com/junaidzx90)*