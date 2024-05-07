//Api地址
//本地接口地址'https://localhost:44301' 
//正式Api地址'http://47.101.163.135:22742' 
//测试地址'https://47.101.163.135:44302'
//https://www.haijiao.tech
const ApiBaseUrl = 'https://www.haijiao.tech'
//Token的前缀
const TokenPrefix = 'Bearer '
//Token最短有效期（5分钟，有效时间低于此值，需要去刷新Token）
const Token_MinValidityPeriod = 5
//每页查询数据量
const PageSize = 20
//内胆柜的格子数量
const CabinetNum = 18
//钥匙柜的格子数量
const LockerNum = 16
//收银箱离线时间阈值（分钟）
const BoxLockerOffLineMinutes = 10
//票箱监控自动刷新时间（15秒）
const Monitor_AutoRefreshInterval = 15 * 1000
//人员注册二维码有效时间（分钟）
const StaffRegister_QrCodeExpireMinutes = 5 
//人员注册上传的照片最大限制（10M转成B）
const StaffRegister_ImageMaxB = 10 * 1024 * 1024
//人员注册上传的照片最小限制（400KB转成B）
const StaffRegister_ImageMinB = 400 * 1024
//人员认证二维码有效时间（毫秒；注：有效时间是在主控机控制，这里要跟主控机保持一致，此参数只用来给用户提示，没有实际性作用）
const StaffCertification_QrCodeExpireMillisecond = 5 * 60 * 1000
//DES密钥
const DES_RgbKey = 'HongLong'
//DESC密钥偏移量（HEX格式）
const DES_RgbIV = 'FF13913177663388'
//无账号用户登录账号
const HL_LoginName = 'IFS_IntrUser'
//无账号用户登录密码
const HL_LoginPassword = 'IFS_IntrUser'
//租户Id
var TenantId = null

export default {
	ApiBaseUrl,
	TokenPrefix,
	Token_MinValidityPeriod,
	PageSize,
	CabinetNum,
	LockerNum,
	BoxLockerOffLineMinutes,
	Monitor_AutoRefreshInterval,
	StaffRegister_QrCodeExpireMinutes,
	StaffRegister_ImageMaxB,
	StaffRegister_ImageMinB,
	StaffCertification_QrCodeExpireMillisecond,
	DES_RgbKey,
	DES_RgbIV,
	HL_LoginName,
	HL_LoginPassword,
	TenantId
}
