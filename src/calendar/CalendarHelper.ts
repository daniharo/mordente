import { InlineKeyboard } from "grammy";
import { InlineKeyboardButton } from "@grammyjs/types";

export interface CalendarOptions {
  startDate: Date;
  startWeekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  weekDayNames: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ];
  monthNames: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ];
  minDate?: Date;
  maxDate?: Date;
  hideIgnoredWeeks: boolean;
  ignoreWeekDays: readonly number[];
  shortcutButtons: InlineKeyboardButton[];
}

const DEFAULT_OPTIONS: Omit<CalendarOptions, "startDate"> = {
  startWeekDay: 1,
  weekDayNames: ["D", "L", "M", "X", "J", "V", "S"],
  monthNames: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  ignoreWeekDays: [],
  hideIgnoredWeeks: false,
  shortcutButtons: [],
};

export class CalendarHelper {
  #options: CalendarOptions;
  constructor(options: Partial<CalendarOptions>) {
    this.#options = Object.assign(
      { ...DEFAULT_OPTIONS, startDate: new Date() },
      options
    );
  }

  #addHeader(keyboard: InlineKeyboard, date: Date) {
    const monthName = this.#options.monthNames[date.getMonth()];
    let year = date.getFullYear();

    if (this.#isInMinMonth(date)) {
      // this is min month, I push an empty button
      keyboard.text(" ", "calendar-telegram-ignore-minmonth");
    } else {
      keyboard.text("<", "calendar-telegram-prev-" + toYyyymmdd(date));
    }

    keyboard.text(monthName + " " + year, "calendar-telegram-ignore-monthname");

    if (this.#isInMaxMonth(date)) {
      // this is max month, I push an empty button
      keyboard.text(" ", "calendar-telegram-ignore-maxmonth");
    } else {
      keyboard.text(">", "calendar-telegram-next-" + toYyyymmdd(date));
    }

    keyboard.row();
    const weekDays = [
      ...this.#options.weekDayNames.slice(this.#options.startWeekDay),
      ...this.#options.weekDayNames.slice(0, this.#options.startWeekDay),
    ];

    keyboard.add(
      ...weekDays.map((e, i) => ({
        text: e,
        callback_data: "calendar-telegram-ignore-weekday" + i,
      }))
    );
  }

  #addDays(keyboard: InlineKeyboard, date: Date) {
    const maxMonthDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const maxDay = this.#getMaxDay(date);
    const minDay = this.#getMinDay(date);

    let daysOfWeekProcessed = 0,
      daysOfWeekIgnored = 0;

    let currentRow = buildFillerRow("firstRow-");
    for (let d = 1; d <= maxMonthDay; d++) {
      date.setDate(d);

      const weekDay = this.#normalizeWeekDay(date.getDay());

      if (d < minDay || d > maxDay) {
        if (
          !this.#options.hideIgnoredWeeks ||
          this.#options.ignoreWeekDays.includes(weekDay)
        ) {
          currentRow[weekDay] = {
            text: strikethroughText(d.toString()),
            callback_data: "calendar-telegram-ignore-" + toYyyymmdd(date),
          };
        }

        daysOfWeekIgnored++;
      } else {
        currentRow[weekDay] = {
          text: d.toString(),
          callback_data: "calendar-telegram-date-" + toYyyymmdd(date),
        };
      }

      daysOfWeekProcessed++;

      if (weekDay == 6 || d == maxMonthDay) {
        if (
          !this.#options.hideIgnoredWeeks ||
          daysOfWeekProcessed !== daysOfWeekIgnored
        ) {
          keyboard.row(...currentRow);
        }
        // I'm at the end of the row: I create a new filler row
        currentRow = buildFillerRow("lastRow-");

        daysOfWeekProcessed = 0;
        daysOfWeekIgnored = 0;
      }
    }
  }

  #addShortcutButtons(keyboard: InlineKeyboard) {
    if (this.#options.shortcutButtons.length > 0) {
      keyboard.add(...this.#options.shortcutButtons);
      keyboard.row();
    }
  }

  getCalendarMarkup(inputDate: Date) {
    let date = inputDate;
    // I use a math clamp to check if the input date is in range
    if (this.#options.minDate && date < this.#options.minDate) {
      date = this.#options.minDate;
    }
    if (this.#options.maxDate && date > this.#options.maxDate) {
      date = this.#options.maxDate;
    }
    const page = new InlineKeyboard();

    this.#addShortcutButtons(page);
    this.#addHeader(page, date);
    this.#addDays(page, date);

    return page;
  }

  #normalizeWeekDay(weekDay: number) {
    const result = weekDay - this.#options.startWeekDay;
    return result < 0 ? result + 7 : result;
  }

  /**
   * Calculates min day depending on input date and minDate in options
   * @param {*Date} date Test date
   * @returns int
   */
  #getMinDay(date: Date) {
    let minDay;
    if (this.#options.minDate && this.#isInMinMonth(date)) {
      minDay = this.#options.minDate.getDate();
    } else {
      minDay = 1;
    }

    return minDay;
  }

  /**
   * Calculates max day depending on input date and maxDate in options
   * @param {*Date} date Test date
   * @returns int
   */
  #getMaxDay(date: Date) {
    let maxDay;
    if (this.#options.maxDate && this.#isInMaxMonth(date)) {
      maxDay = this.#options.maxDate.getDate();
    } else {
      maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    return maxDay;
  }

  /**
   * Check if input date is in same year and month as min date
   */
  #isInMinMonth(date: Date) {
    return this.#options.minDate
      ? isSameMonth(this.#options.minDate, date)
      : false;
  }

  /**
   * Check if input date is in same year and month as max date
   */
  #isInMaxMonth(date: Date) {
    return this.#options.maxDate
      ? isSameMonth(this.#options.maxDate, date)
      : false;
  }
}

/**
 * Builds an array of seven ignored callback buttons
 * @param {*String} prefix String to be added before the element index
 */
const buildFillerRow: (prefix: string) => InlineKeyboardButton[] = (
  prefix: string
) => {
  const buttonKey = "calendar-telegram-ignore-filler-" + prefix;
  return Array.from({ length: 7 }, (v, k) => ({
    text: " ",
    callback_data: buttonKey + k,
  }));
};

/**
 * This uses unicode to draw strikethrough on text
 * @param {*String} text text to modify
 */
const strikethroughText = (text: string) =>
  text.split("").reduce(function (acc, char) {
    return acc + char + "\u0336";
  }, "");

/**
 * Check if myDate is in same year and month as testDate
 * @param {*Date} myDate input date
 * @param {*Date} testDate test date
 * @returns bool
 */
const isSameMonth = (myDate: Date, testDate: Date) => {
  if (!myDate) return false;

  testDate = testDate || new Date();

  return (
    myDate.getFullYear() === testDate.getFullYear() &&
    myDate.getMonth() === testDate.getMonth()
  );
};

const toYyyymmdd = (date: Date) => {
  let mm = date.getMonth() + 1; // getMonth() is zero-based
  let dd = date.getDate();

  return [
    date.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("-");
};
