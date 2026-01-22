import { QueueStatus } from "@/types";
import { getQueue, getSettings, setSettings } from "@/services/storageService";
import { SCHEDULE_ALARM_NAME } from "./types";
import { getProcessingState } from "./state";

export function setupAlarmListener(startProcessing: () => Promise<void>): void {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === SCHEDULE_ALARM_NAME) {
      const settings = await getSettings();
      if (!settings.schedule.enabled) return;

      const queue = await getQueue();
      const hasPending = queue.some((item) => item.status === QueueStatus.Pending);
      if (!hasPending) {
        await setSettings({
          schedule: { enabled: false, scheduledTime: null, repeatDaily: false },
        });
        return;
      }

      const state = await getProcessingState();
      if (!state.isProcessing) {
        startProcessing();
      }

      if (settings.schedule.repeatDaily && settings.schedule.scheduledTime) {
        const nextTime = settings.schedule.scheduledTime + 24 * 60 * 60 * 1000;
        await setSettings({
          schedule: { ...settings.schedule, scheduledTime: nextTime },
        });
        chrome.alarms.create(SCHEDULE_ALARM_NAME, { when: nextTime });
      } else {
        await setSettings({
          schedule: { enabled: false, scheduledTime: null, repeatDaily: false },
        });
      }
    }
  });
}
