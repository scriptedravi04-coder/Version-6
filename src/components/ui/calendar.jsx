import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "../../lib/utils"

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}) {
  return (
    <div className={cn("p-3 bg-white text-black rounded-lg shadow-lg dark:bg-zinc-900 dark:text-white", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        {...props} 
      />
    </div>
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
