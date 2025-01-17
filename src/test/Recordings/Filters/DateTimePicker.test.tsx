/*
 * Copyright The Cryostat Authors
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any
 * person obtaining a copy of this software, associated documentation and/or data
 * (collectively the "Software"), free of charge and under any and all copyright
 * rights in the Software, and any and all patent rights owned or freely
 * licensable by each licensor hereunder covering either (i) the unmodified
 * Software as contributed to or provided by such licensor, or (ii) the Larger
 * Works (as defined below), to deal in both
 *
 * (a) the Software, and
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if
 * one is included with the Software (each a "Larger Work" to which the Software
 * is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create
 * derivative works of, display, perform, and distribute the Software and make,
 * use, sell, offer for sale, import, export, have made, and have sold the
 * Software and the Larger Work(s), and to sublicense the foregoing rights on
 * either these or other terms.
 *
 * This license is subject to the following condition:
 * The above copyright notice and either this complete permission notice or at
 * a minimum a reference to the UPL must be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const onDateTimeSelect = jest.fn((date) => {
  /**Do nothing. Used for checking renders */
});

// Mock system time
const currentDate = new Date('14 Sep 2022 00:00:00 UTC');
jest.useFakeTimers('modern').setSystemTime(currentDate);

import { DateTimePicker } from '@app/Recordings/Filters/DateTimePicker';

describe('<DateTimePicker />', () => {
  afterAll(jest.useRealTimers);

  afterEach(cleanup);

  it('renders correctly', async () => {
    /** Skip snapshot test as component depends on DOM */
  });

  it('should open calendar when calendar icon is clicked', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const calendarIcon = screen.getByRole('button', { name: 'Toggle date picker' });
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toBeVisible();

    userEvent.click(calendarIcon);

    const calendar = await screen.findByRole('dialog');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toBeVisible();
  });

  it('should close calendar when calendar icon is clicked', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const calendarIcon = screen.getByRole('button', { name: 'Toggle date picker' });
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toBeVisible();

    userEvent.click(calendarIcon);

    const calendar = await screen.findByRole('dialog');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toBeVisible();

    userEvent.click(calendarIcon);

    await waitFor(() => {
      expect(calendar).not.toBeInTheDocument();
      expect(calendar).not.toBeVisible();
    });
  });

  it('should enable search icon when date is selected', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const calendarIcon = screen.getByRole('button', { name: 'Toggle date picker' });
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toBeVisible();

    userEvent.click(calendarIcon);

    const calendar = await screen.findByRole('dialog');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toBeVisible();

    const dateOption = within(calendar).getByRole('button', { name: '14 September 2022' });
    expect(dateOption).toBeInTheDocument();
    expect(dateOption).toBeVisible();

    userEvent.click(dateOption);

    await waitFor(() => {
      expect(calendar).not.toBeInTheDocument();
      expect(calendar).not.toBeVisible();
    });

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).not.toBeDisabled();
  });

  it('should update date time when date is selected and search icon is clicked', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const calendarIcon = screen.getByRole('button', { name: 'Toggle date picker' });
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toBeVisible();

    userEvent.click(calendarIcon);

    const calendar = await screen.findByRole('dialog');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toBeVisible();

    const dateOption = within(calendar).getByRole('button', { name: '14 September 2022' });
    expect(dateOption).toBeInTheDocument();
    expect(dateOption).toBeVisible();

    userEvent.click(dateOption);

    await waitFor(() => {
      expect(calendar).not.toBeInTheDocument();
      expect(calendar).not.toBeVisible();
    });

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).not.toBeDisabled();

    userEvent.click(searchIcon);

    expect(onDateTimeSelect).toHaveBeenCalledTimes(1);
    expect(onDateTimeSelect).toHaveBeenCalledWith(currentDate.toISOString());
  });

  it('should update date time when both date and time are selected and search icon is clicked', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    // Select a date
    const calendarIcon = screen.getByRole('button', { name: 'Toggle date picker' });
    expect(calendarIcon).toBeInTheDocument();
    expect(calendarIcon).toBeVisible();

    userEvent.click(calendarIcon);

    const calendar = await screen.findByRole('dialog');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toBeVisible();

    const dateOption = within(calendar).getByRole('button', { name: '14 September 2022' });
    expect(dateOption).toBeInTheDocument();
    expect(dateOption).toBeVisible();

    userEvent.click(dateOption);

    await waitFor(() => {
      expect(calendar).not.toBeInTheDocument();
      expect(calendar).not.toBeVisible();
    });

    // Select a time
    const timeInput = screen.getByLabelText('Time Picker');
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toBeVisible();

    userEvent.click(timeInput);

    const timeMenu = await screen.findByRole('menu', { name: 'Time Picker' });
    expect(timeMenu).toBeInTheDocument();
    expect(timeMenu).toBeVisible();

    const noonOption = within(timeMenu).getByRole('menuitem', { name: '12:00' });
    expect(noonOption).toBeInTheDocument();
    expect(noonOption).toBeVisible();

    userEvent.click(noonOption);

    expect(timeMenu).not.toBeInTheDocument();
    expect(timeMenu).not.toBeVisible();

    // Submit
    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).not.toBeDisabled();

    userEvent.click(searchIcon);

    expect(onDateTimeSelect).toHaveBeenCalledTimes(1);
    const expectedDate = new Date(currentDate);
    expectedDate.setUTCHours(12, 0);
    expect(onDateTimeSelect).toHaveBeenCalledWith(expectedDate.toISOString());
  });

  it('should enable search icon when a valid date is entered', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const dateInput = screen.getByLabelText('Date Picker');
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toBeVisible();

    userEvent.type(dateInput, '2022-09-14');
    userEvent.type(dateInput, '{enter}');

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).not.toBeDisabled();
  });

  it('should show error when an invalid date is entered', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const dateInput = screen.getByLabelText('Date Picker');
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toBeVisible();

    userEvent.type(dateInput, 'invalid_date');
    userEvent.type(dateInput, '{enter}');

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).toBeDisabled();

    const errorMessage = await screen.findByText('Invalid date');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toBeVisible();
  });

  it('should open time menu when time input is clicked', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const timeInput = screen.getByLabelText('Time Picker');
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toBeVisible();

    userEvent.click(timeInput);

    const timeMenu = await screen.findByRole('menu', { name: 'Time Picker' });
    expect(timeMenu).toBeInTheDocument();
    expect(timeMenu).toBeVisible();
  });

  it('should close time menu when time input is clicked and then ', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const timeInput = screen.getByLabelText('Time Picker');
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toBeVisible();

    userEvent.click(timeInput);

    const timeMenu = await screen.findByRole('menu', { name: 'Time Picker' });
    expect(timeMenu).toBeInTheDocument();
    expect(timeMenu).toBeVisible();

    userEvent.click(document.body); // Click elsewhere

    expect(timeMenu).not.toBeInTheDocument();
    expect(timeMenu).not.toBeVisible();
  });

  it('should disable search icon when no date is selected', () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).toBeDisabled();
  });

  it('should still disable search icon when time is selected', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const timeInput = screen.getByLabelText('Time Picker');
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toBeVisible();

    userEvent.click(timeInput);

    const timeMenu = await screen.findByRole('menu', { name: 'Time Picker' });
    expect(timeMenu).toBeInTheDocument();
    expect(timeMenu).toBeVisible();

    const noonOption = within(timeMenu).getByRole('menuitem', { name: '12:00' });
    expect(noonOption).toBeInTheDocument();
    expect(noonOption).toBeVisible();

    userEvent.click(noonOption);

    expect(timeMenu).not.toBeInTheDocument();
    expect(timeMenu).not.toBeVisible();

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).toBeDisabled();
  });

  it('should show error when an invalid time is entered', async () => {
    render(<DateTimePicker onSubmit={onDateTimeSelect} />);

    const timeInput = screen.getByLabelText('Time Picker');
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toBeVisible();

    userEvent.type(timeInput, 'invalid_time');
    userEvent.type(timeInput, '{enter}');

    const searchIcon = screen.getByRole('button', { name: 'Search For Date' });
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toBeVisible();
    expect(searchIcon).toBeDisabled();

    const errorMessage = await screen.findByText('Invalid time format');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toBeVisible();
  });
});
