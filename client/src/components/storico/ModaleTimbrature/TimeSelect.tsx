import * as Select from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function TimeSelect({ value, onChange, className = "", disabled = false }: TimeSelectProps) {
  // value formato "HH:mm"
  const [hours, minutes] = value?.split(":") ?? ["", ""];
  
  const hoursList = Array.from({length: 24}, (_, i) => String(i).padStart(2, "0"));
  const minutesList = Array.from({length: 60}, (_, i) => String(i).padStart(2, "0"));

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minutes || "00"}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hours || "00"}:${newMinute}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Selector Hours */}
      <Select.Root value={hours} onValueChange={handleHourChange} disabled={disabled}>
        <Select.Trigger className="bn-field-input flex items-center justify-between w-full">
          <Select.Value placeholder="HH" />
          <Select.Icon>
            <ChevronDown size={16} className="text-white/60" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="bn-time-popover" position="popper" sideOffset={4}>
            <Select.ScrollUpButton className="flex items-center justify-center h-6">
              <ChevronUp size={14} className="text-white/60" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1 max-h-48">
              {hoursList.map(hour => (
                <Select.Item key={hour} value={hour} className="bn-time-item flex items-center gap-2 rounded">
                  <Select.ItemIndicator>
                    <Check size={14} />
                  </Select.ItemIndicator>
                  <Select.ItemText>{hour}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-6">
              <ChevronDown size={14} className="text-white/60" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {/* Selector Minutes */}
      <Select.Root value={minutes} onValueChange={handleMinuteChange} disabled={disabled}>
        <Select.Trigger className="bn-field-input flex items-center justify-between w-full">
          <Select.Value placeholder="MM" />
          <Select.Icon>
            <ChevronDown size={16} className="text-white/60" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="bn-time-popover" position="popper" sideOffset={4}>
            <Select.ScrollUpButton className="flex items-center justify-center h-6">
              <ChevronUp size={14} className="text-white/60" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1 max-h-48">
              {minutesList.map(minute => (
                <Select.Item key={minute} value={minute} className="bn-time-item flex items-center gap-2 rounded">
                  <Select.ItemIndicator>
                    <Check size={14} />
                  </Select.ItemIndicator>
                  <Select.ItemText>{minute}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-6">
              <ChevronDown size={14} className="text-white/60" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
