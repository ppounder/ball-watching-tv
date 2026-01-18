import { ChannelMode, ScheduleItemType, NowBundle, ScheduleItem } from '@/types/scheduler';

/**
 * Maps schedule item types to channel modes.
 * Some item types directly correspond to modes, others need fallback.
 */
const ITEM_TYPE_TO_MODE: Partial<Record<ScheduleItemType, ChannelMode>> = {
  NEWS: 'NEWS',
  LIVE: 'LIVE',
  PODCAST: 'PODCAST',
};

/**
 * Derives the effective channel mode from the current schedule item.
 * Falls back to channel_state.mode if no current item or item type doesn't map to a mode.
 */
export function deriveChannelMode(bundle: NowBundle | null): ChannelMode {
  if (!bundle) {
    return 'OFF_AIR';
  }

  const fallbackMode = bundle.channel_state?.mode ?? 'OFF_AIR';

  // Get current schedule item
  const currentItemId = bundle.now?.current_schedule_item_id;
  if (!currentItemId) {
    return fallbackMode;
  }

  const currentItem = bundle.items?.find(
    (item: ScheduleItem) => item.schedule_item_id === currentItemId
  );

  if (!currentItem) {
    return fallbackMode;
  }

  // Derive mode from item type, or fall back
  const derivedMode = ITEM_TYPE_TO_MODE[currentItem.schedule_item_type];
  return derivedMode ?? fallbackMode;
}
