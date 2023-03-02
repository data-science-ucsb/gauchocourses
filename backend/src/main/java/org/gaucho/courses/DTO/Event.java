import java.util.List;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventReminder;
import java.util.TimeZone;

public class Event {
    private String summary;
    private DateTime start;
    private DateTime end;
    private TimeZone timeZone;
    private List<EventAttendee> attendees;
    private List<EventReminder> reminders;

    public Event(String summary, DateTime start, DateTime end, TimeZone timeZone, List<EventAttendee> attendees, List<EventReminder> reminders) {
        this.summary = summary;
        this.start = start;
        this.end = end;
        this.timeZone = timeZone;
        this.attendees = attendees;
        this.reminders = reminders;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public DateTime getStart() {
        return start;
    }

    public void setStart(DateTime start) {
        this.start = start;
    }

    public DateTime getEnd() {
        return end;
    }

    public void setEnd(DateTime end) {
        this.end = end;
    }

    public TimeZone getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(TimeZone timeZone) {
        this.timeZone = timeZone;
    }

    public List<EventAttendee> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<EventAttendee> attendees) {
        this.attendees = attendees;
    }

    public List<EventReminder> getReminders() {
        return reminders;
    }

    public void setReminders(List<EventReminder> reminders) {
        this.reminders = reminders;
    }
}