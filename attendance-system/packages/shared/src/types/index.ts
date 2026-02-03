// @attendance/shared - 共享类型定义
// 所有端共用的类型，严禁依赖其他业务模块

export * from './common';
export * from './user';
export * from './employee';
export * from './department';
export * from './attendance/base';
export * from './attendance/schedule';
export * from './attendance/record';
// export * from './attendance/correction'; // Conflict with DailyRecordVo
export {
  QueryDailyRecordsDto,
  SupplementCheckInDto,
  SupplementCheckOutDto,
  SupplementResultVo,
  QueryCorrectionsDto,
  CorrectionVo,
  CorrectionListVo,
  UpdateCorrectionDto,
  CorrectionDailyRecordVo
} from './attendance/correction';
export * from './attendance/stats';
export * from './attendance/leave';
