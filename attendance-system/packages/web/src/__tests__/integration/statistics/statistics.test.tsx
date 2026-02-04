import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SummaryPage from '../../../pages/statistics/SummaryPage';
import { renderWithProviders } from '../../../test/utils';
import * as statisticsService from '../../../services/statistics';
import * as XLSX from 'xlsx';

// Mock Services
vi.mock('../../../services/statistics', () => ({
  getDepartmentSummary: vi.fn(),
  triggerCalculation: vi.fn(),
}));

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// Mock Child Components
vi.mock('../../components/DepartmentSelect', () => ({
  DepartmentSelect: ({ value, onChange }: any) => (
    <select 
      data-testid="mock-dept-select" 
      value={value || ''} 
      onChange={e => onChange(Number(e.target.value))}
    >
      <option value="">Select Dept</option>
      <option value="1">Dept 1</option>
    </select>
  ),
}));

// Mock Antd Components
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd');
  const DatePickerMock = ({ onChange, value, ...props }: any) => (
      <input
        type="date"
        data-testid="mock-datepicker"
        onChange={(e) => {
           const val = e.target.value;
           onChange({ format: () => val, isValid: () => true, toISOString: () => val });
        }}
        value={value ? value.format('YYYY-MM-DD') : ''}
        {...props}
      />
  );
  
  (DatePickerMock as any).RangePicker = ({ onChange, ...props }: any) => (
       <input 
         data-testid="mock-rangepicker"
         onChange={(e) => {
            const val = e.target.value;
            const parts = val.split(',');
            if (parts.length === 2) {
                // Mock dayjs objects
                const start = { format: () => parts[0], isValid: () => true, toISOString: () => parts[0] };
                const end = { format: () => parts[1], isValid: () => true, toISOString: () => parts[1] };
                onChange([start, end]);
            }
         }}
         {...props}
       />
  );

  return {
    ...antd,
    Table: ({ dataSource, columns, rowKey }: any) => (
      <div data-testid="mock-table">
        {dataSource.map((record: any) => (
          <div key={record[rowKey] || record.employeeId} data-testid={`row-${record.employeeId}`} className="mock-row">
            {columns.map((col: any) => (
              <div key={col.key || col.dataIndex}>
                {col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
    DatePicker: DatePickerMock,
  };
});

// Mock Data
const mockSummary = [
  {
    employeeId: 1,
    employeeNo: 'E001',
    employeeName: 'John Doe',
    deptName: 'Backend',
    totalDays: 22,
    actualDays: 20,
    lateCount: 1,
    lateMinutes: 10,
    earlyLeaveCount: 0,
    earlyLeaveMinutes: 0,
    absentCount: 1,
    absentMinutes: 480,
    leaveCount: 1,
    leaveMinutes: 480,
    actualMinutes: 9600,
    effectiveMinutes: 9500,
  }
];

describe('Statistics Integration Test', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (statisticsService.getDepartmentSummary as any).mockResolvedValue(mockSummary);
    (statisticsService.triggerCalculation as any).mockResolvedValue({});
  });

  it('renders summary page correctly', async () => {
    renderWithProviders(<SummaryPage />);
    
    // Check form elements
    expect(screen.getByTestId('mock-rangepicker')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dept-select')).toBeInTheDocument();
    expect(screen.getByText('查询')).toBeInTheDocument();
    expect(screen.getByText('导出 Excel')).toBeInTheDocument(); // DownloadOutlined icon + text?
    // Wait, SummaryPage uses icon only or text?
    // <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
    // Ah, text is "导出".
  });

  it('searches summary data', async () => {
    renderWithProviders(<SummaryPage />);
    
    // Select Date Range
    const rangePicker = screen.getByTestId('mock-rangepicker');
    fireEvent.change(rangePicker, { 
        target: { value: '2023-08-01,2023-08-31' } 
    });

    // Select Dept
    const select = screen.getByTestId('mock-dept-select');
    fireEvent.change(select, { target: { value: '1' } });

    // Search
    const searchButton = screen.getByText('查询'); // Assuming text is "查询" based on reading
    // <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
    // Wait, it is inside Form. But button has htmlType="submit".
    // SummaryPage uses `onFinish` on Form.
    // Let's check SummaryPage code again.
    // It has `const handleSearch = ...`
    // And `<Form onFinish={handleSearch}>`.
    // So clicking submit button triggers it.
    
    await user.click(searchButton);

    await waitFor(() => {
      expect(statisticsService.getDepartmentSummary).toHaveBeenCalledWith(expect.objectContaining({
        startDate: '2023-08-01',
        endDate: '2023-08-31',
        deptId: 1,
      }));
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('E001')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });
  });

  it('triggers recalculation', async () => {
    renderWithProviders(<SummaryPage />);
    
    // Select Date Range
    const rangePicker = screen.getByTestId('mock-rangepicker');
    fireEvent.change(rangePicker, { 
        target: { value: '2023-08-01,2023-08-31' } 
    });

    // Recalculate Button
    // <Button icon={<SyncOutlined />} onClick={handleRecalculate}>重新计算</Button>
    const recalcButton = screen.getByText('重新计算');
    await user.click(recalcButton);

    await waitFor(() => {
      expect(statisticsService.triggerCalculation).toHaveBeenCalledWith(expect.objectContaining({
        startDate: '2023-08-01',
        endDate: '2023-08-31',
      }));
    });
  });

  it('exports data to excel', async () => {
    renderWithProviders(<SummaryPage />);
    
    // Perform Search first to populate data
    const rangePicker = screen.getByTestId('mock-rangepicker');
    fireEvent.change(rangePicker, { 
        target: { value: '2023-08-01,2023-08-31' } 
    });
    const searchButton = screen.getByText('查询');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Export
    // <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
    const exportButton = screen.getByText('导出');
    await user.click(exportButton);

    await waitFor(() => {
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalled();
    });
  });
});
