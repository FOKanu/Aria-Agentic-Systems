import { useEffect, useRef } from 'react';
import { useCalendarEvents } from './useCalendarEvents';
import { useNotifications } from './useNotifications';
import { useToast } from './use-toast';
import { differenceInMinutes, isBefore, addMinutes, parseISO } from 'date-fns';

export function useEventMonitor() {
  const { events } = useCalendarEvents();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  // Keep track of notified events to avoid spamming
  const notifiedEventsRef = useRef<Set<string>>(new Set());
  const startedWorkflowsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkEvents = () => {
      const now = new Date();

      events.forEach(event => {
        const startTime = new Date(event.start_time);
        const minutesUntilStart = differenceInMinutes(startTime, now);

        // 1. Upcoming Event Alerts (15 mins before)
        if (minutesUntilStart <= 15 && minutesUntilStart > 0) {
          if (!notifiedEventsRef.current.has(`${event.id}-upcoming`)) {
            addNotification({
              type: 'info',
              title: 'Upcoming Event',
              message: `"${event.title}" starts in ${minutesUntilStart} minutes.`,
              agentName: event.assigned_agent || 'System',
              agentId: event.assigned_agent?.toLowerCase()
            });

            notifiedEventsRef.current.add(`${event.id}-upcoming`);
          }
        }

        // 2. Auto-Execution (At start time)
        // Check if it's time to start (within last 1 minute) and hasn't been started yet
        const isTime = isBefore(startTime, now) && isBefore(now, addMinutes(startTime, 5));

        if (event.auto_start && isTime) {
          if (!startedWorkflowsRef.current.has(event.id)) {
            // Trigger Workflow
            const agentName = event.assigned_agent || 'AI Assistant';

            addNotification({
              type: 'success',
              title: 'Workflow Started',
              message: `${agentName} is starting: ${event.title}`,
              agentName: agentName,
              agentId: event.assigned_agent?.toLowerCase(),
              actionLabel: 'View Progress',
              onAction: () => console.log('Navigate to workflow view') // TODO: Navigate to workflow
            });

            toast({
              title: "🤖 Auto-Pilot Engaged",
              description: `${agentName} has started working on "${event.title}"`,
              duration: 5000,
            });

            startedWorkflowsRef.current.add(event.id);

            // TODO: In a real backend, we would hit an API to trigger the agent here
            console.log(`[EventMonitor] Triggering workflow for event: ${event.id}`);
          }
        }
      });
    };

    // Check immediately
    checkEvents();

    // Then check every minute
    const intervalId = setInterval(checkEvents, 60000);

    return () => clearInterval(intervalId);
  }, [events, addNotification, toast]);
}
