import dayjs from 'dayjs'
import cryptoJS from 'crypto-js'
import global from '@/common/global.js'

/**
 * rpx 转换为 px ，传参类型是数字（Number）
 * @param {Object} rpx
 */
function RpxTopx(rpx) {
	let deviceWidth = wx.getSystemInfoSync().windowWidth; //获取设备屏幕宽度
	let px = (deviceWidth / 750) * Number(rpx)
	return Math.floor(px);
}

/**
 * px 转换为 rpx ，传参类型是数字（Number）
 * @param {Object} px
 */
function PxTorpx(px) {
	let deviceWidth = wx.getSystemInfoSync().windowWidth; //获取设备屏幕宽度
	let rpx = (750 / deviceWidth) * Number(px)
	return Math.floor(rpx);

}

/**
 * 处理日期字符串
 */
function StrToDate(datestr, format = 'YYYY-MM-DD HH:mm:ss') {
	return dayjs(datestr).format(format)
}

/**
 * 给日期加减多少毫秒，返回处理后的时间
 * @param {Object} date
 * @param {Object} millisecond
 */
function AddMilliseconds(date, millisecond) {
	if (date) {
		var min = date.getMilliseconds()
		date.setMilliseconds(min + millisecond)
	}

	return date
}

/**
 * 函数节流
 * @param {Object} fn
 * @param {Object} interval
 */
function Throttle(fn, interval) {
	var enterTime = 0; //触发的时间
	var gapTime = interval || 300; //间隔时间，如果interval不传，则默认300ms
	return function() {
		var context = this;
		var backTime = new Date(); //第一次函数return即触发的时间
		if (backTime - enterTime > gapTime) {
			fn.call(context, arguments);
			enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
		}
	};
}

/**
 * 函数防抖
 * @param {Object} fn
 * @param {Object} interval
 */
function Debounce(fn, interval) {
	var timer;
	var gapTime = interval || 100; //间隔时间，如果interval不传，则默认100ms
	return function() {
		clearTimeout(timer);
		var context = this;
		var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
		timer = setTimeout(function() {
			fn.call(context, args);
		}, gapTime);
	};
}

/**
 * 将指定的string中的所有字符编码为一个字节序列
 * @param {Object} text
 */
function EncodeUtf8(text) {
	var code = encodeURIComponent(text);
	var bytes = [];
	for (var i = 0; i < code.length; i++) {
		var c = code.charAt(i);
		if (c === '%') {
			var hex = code.charAt(i + 1) + code.charAt(i + 2);
			var hexVal = parseInt(hex, 16);
			bytes.push(hexVal);
			i += 2;
		} else bytes.push(c.charCodeAt(0));
	}
	return bytes;
}

/**
 * DES  CBC模式加密
 * @param {Object} ciphertext --解密内容
 * @param {Object} key --秘钥
 * @param {Object} iv --偏移量
 */
function EncryptByDES(message, key = global.DES_RgbKey, iv = global.DES_RgbIV) {
	//密钥
	var keyHex = cryptoJS.enc.Utf8.parse(key)
	//偏移量
	var ivHex = cryptoJS.enc.Hex.parse(iv)
	//加密
	var encrypted = cryptoJS.DES.encrypt(message, keyHex, {
		iv: ivHex,
		mode: cryptoJS.mode.CBC,
		padding: cryptoJS.pad.Pkcs7
	})

	return encrypted.toString() // 返回base64格式密文，如需返回hex格式：encrypted.ciphertext.toString()
}

/**
 * DES  CBC模式解密
 * @param {Object} ciphertext --解密内容
 * @param {Object} key --秘钥
 * @param {Object} iv --偏移量
 */
function DecryptByDES(ciphertext, key = global.DES_RgbKey, iv = global.DES_RgbIV) {
	//密钥
	var keyHex = cryptoJS.enc.Utf8.parse(key)
	//偏移量
	var ivHex = cryptoJS.enc.Hex.parse(iv)
	//解密
	var decrypted = cryptoJS.DES.decrypt({
		ciphertext: cryptoJS.enc.Base64.parse(ciphertext)
	}, keyHex, {
		iv: ivHex,
		mode: cryptoJS.mode.CBC,
		padding: cryptoJS.pad.Pkcs7
	})

	return decrypted.toString(cryptoJS.enc.Utf8)
}

/**
 * 0x01版本加密算法
 * @param {Object} source 	--需要加密的数据
 * @param {Object} key 		--8字节明文秘钥
 * @param {Object} length 	--数据长度
 */

function HLCommEncrypt(source, key, length) {
	// 创建一个新的Uint8Array来存储加密后的数据
	const outBuffer = new Uint8Array(length);
	for (let i = 0; i < length; i++) {
		// 加密操作，注意JavaScript中数组索引从0开始，不需要调整  
		let temp = source[i] + (key[7 - (i % 8)] + i)
		outBuffer[i] = temp ^ key[i % 8]
		// source[i] += (key[7 - (i % 8)] + i); // 使用按位与操作来确保结果在0-255之间  
		// outBuffer[i] = source[i] ^ key[i % 8]; // 使用异或操作进行加密  
	}

	// 返回加密后的数据数组  
	return outBuffer;
}

/**
 * 0x01版本解密算法
 * @param {Object} source	--需要加密的数据
 * @param {Object} key 		--8字节明文秘钥
 * @param {Object} length 	--数据长度
 */
function HLCommDecrypt(source, key, length) {
	const outBuffer = new Uint8Array(length);
	for (let i = 0; i < length; i++) {
		// 先执行异或操作的逆操作  
		let temp = source[i] ^ key[i % 8];
		temp -= (key[7 - (i % 8)] + i);

		// 存储解密后的值  
		outBuffer[i] = temp;
	}

	// 返回解密后的数据数组
	return outBuffer;
}

/**
 * 生成Guid
 */
function GenerateGuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

/**
 * 根据图片路径获取Base64数据
 * @param {Object} tempFilePath
 */
async function GetImageBase64_ReadFile(tempFilePath) {
	return new Promise(resolve => {
		//获取全局唯一的文件管理器 
		uni.getFileSystemManager().readFile({ //读取本地文件内容
			filePath: tempFilePath, // 文件路径
			encoding: 'base64', // 返回格式
			success: ({
				data
			}) => {
				return resolve(data)
			}
		})
	})
}

/**
 * 等待
 * @param {Object} d --等待时间（毫秒）
 */
function Sleep(d) {
	for (var t = Date.now(); Date.now() - t <= d;);
}

/**
 * 时间提示
 */
function TimeTip() {
	var date = new Date()
	var hour = date.getHours();
	console.log("现在时间是:" + hour + "点!")
	if (hour >= 0 && hour < 12) {
		return '上午好'
	} else if (hour === 12) {
		return '中午好'
	} else if (hour > 12 && hour < 18) {
		return '下午好'
	} else {
		return '晚上好'
	}
}

/**
 * 处理扫描后的二维码信息
 * @param {Object} scanCodeRes --二维码结果
 * @param {Object} pageName --页面名称
 */
function ProcessingQrCodeInfo(scanCodeRes, pageName) {
	var val = ''

	//如果用户扫描的是小程序码，要从path中截取有效字符；
	//扫描的是二维码则直接返回扫码内容
	if (scanCodeRes.path && scanCodeRes.path.includes(pageName) && scanCodeRes.scanType == 'WX_CODE') {
		var start = scanCodeRes.path.lastIndexOf('scene')
		if (start > 0) {
			//path：pages/xxx/xxx?scene=xxxxxxxxxxxxxxxxxxx
			//6为'scene='的长度，只要scene的值即可
			val = scanCodeRes.path.substring(start + 6)
		}
	}
	//  else {
	// 	val = scanCodeRes.result
	// }

	return val
}

/**
 * 隐藏加载动画，停止下拉刷新
 */
function StopPullDownRefreshStatus() {
	console.log('调用了下拉刷新回调函数')
	//wx.hideLoading();
	uni.hideNavigationBarLoading();
	//停止下拉刷新
	uni.stopPullDownRefresh();
}

/**
 * 10进制转16进制
 * @param {Object} decStr --10进制字符串
 */
function DecToHexStr(decStr) {
	let dec = parseInt(decStr, 10);
	let hex = dec.toString(16);
	let result = hex.length == 1 ? '0' + hex : hex;

	return result.toUpperCase();
}

/**
 * 16进制转10进制
 * @param {Object} hexStr --16进制字符串
 * @param {Object} length --返回的10进制长度（默认为10）
 */
function HexToDecStr(hexStr, length = 10) {
	var decimal = parseInt(hexStr, 16); // 转换为10进制数  
	var result = decimal.toString().padStart(length, '0'); //补齐长度为10的字符串，不足部分用0填充  

	return result;
}

/**
 * ArrayBuffer转16进度字符串
 * @param {Object} buffer --ArrayBuffer
 */
function ArrayBufferToHex(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join('');
}

/**
 * 将16进制字符串分割成数组
 * @param {Object} hexStr --16进制字符串
 */
function SplitHexString(hexStr) {
	var hexArr = []

	// 确保输入是有效的16进制字符串  
	if (!/^[0-9A-Fa-f]+$/.test(hexStr)) {
		return hexArr;
	}

	// 使用正则表达式匹配每两个字符  
	hexArr = hexStr.match(/..?/g);

	// 移除可能的最后一个空字符串（如果字符串长度是奇数）  
	if (hexArr[hexArr.length - 1] === '') {
		hexArr.pop();
	}

	return hexArr;
}

/**
 * 16进制转字符串
 * @param {Object} hex -16进制数据
 */
function HexToString(hex) {
	let str = '';
	for (let i = 0; i < hex.length; i += 2) {
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}

	return str;
}

/**
 * 字符串转16进制
 * @param {Object} str --字符串
 */
function StrToHexString(str) {
	let hex = '';
	for (let i = 0; i < str.length; i++) {
		let charCode = str.charCodeAt(i);
		let hexCharCode = charCode.toString(16);
		hexCharCode = hexCharCode.length === 1 ? '0' + hexCharCode : hexCharCode;
		hex += hexCharCode;
	}

	return hex;

}

/**
 * 根据目标长度填充
 * @param {Object} arr	--原数组数据
 * @param {Object} targetLength --目标长度
 * @param
 */
function PadArrayWithZeros(arr, targetLength, char = '00') {
	const newArr = arr.slice(); // 复制原数组  
	while (newArr.length < targetLength) {
		newArr.push(char); // 添加指定字符直到达到目标长度  
	}

	return newArr;
}

export {
	EncryptByDES,
	DecryptByDES,
	HLCommEncrypt,
	HLCommDecrypt,
	RpxTopx,
	PxTorpx,
	StrToDate,
	AddMilliseconds,
	Throttle,
	Debounce,
	GenerateGuid,
	GetImageBase64_ReadFile,
	Sleep,
	TimeTip,
	ProcessingQrCodeInfo,
	StopPullDownRefreshStatus,
	DecToHexStr,
	HexToDecStr,
	ArrayBufferToHex,
	SplitHexString,
	HexToString,
	StrToHexString,
	PadArrayWithZeros
}