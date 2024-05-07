class BluetoothManager {
	constructor() {
		this.deviceId = null // 存储已连接设备的ID  
		this.serviceId = null // 存储服务的ID  
		this.write_CharacteristicId = null // 存储特征的ID（用来发送命令）
		this.read_CharacteristicId = null // 存储特征的ID（用来接收回复）
	}

	/**
	 * 初始化蓝牙适配器
	 */
	OpenBluetoothAdapter() {
		return new Promise((resolve, reject) => {
			uni.openBluetoothAdapter({
				mode: 'central',
				success: (res) => {
					console.log('初始化蓝牙成功', res);
					resolve({ 'code': 0, 'data': res})
				},
				fail: (err) => {
					console.error('初始化蓝牙失败', err);
					resolve({ 'code': -1, 'data': err})
				}
			});
		});
	}

	/**
	 * 开始扫描设备
	 */
	StartBluetoothDevicesDiscovery() {
		return new Promise((resolve, reject) => {
			if (this.deviceId) {
				console.warn('已经连接设备，无需扫描');
				return resolve();
			}
			uni.startBluetoothDevicesDiscovery({
				allowDuplicatesKey: true,
				success: (res) => {
					console.log('开始扫描设备成功', res);
					resolve(res)
				},
				fail: (err) => {
					console.error('开始扫描设备失败', err);
					resolve(err)
				}
			});
		});
	}

	/**
	 * 停止扫描设备
	 */
	StopBluetoothDevicesDiscovery() {
		return new Promise((resolve, reject) => {
			uni.stopBluetoothDevicesDiscovery({
				success: (res) => {
					console.log('停止扫描设备成功', res);
					resolve(res)
				},
				fail: (err) => {
					console.error('停止扫描设备失败', err);
					resolve(err)
				}
			});
		});
	}

	/**
	 * 连接设备
	 * @param {Object} deviceId
	 */
	CreateBLEConnection(deviceId) {
		return new Promise((resolve, reject) => {
			this.deviceId = deviceId;
			uni.createBLEConnection({
				deviceId: deviceId,
				success: (res) => {
					console.log('连接设备成功', res);
					resolve(res)
				},
				fail: (err) => {
					console.error('连接设备失败', err);
					resolve(err)
				}
			});
		});
	}

	/**
	 * 断开设备连接
	 */
	DisconnectDevice() {
		return new Promise((resolve, reject) => {
			if (!this.deviceId) {
				console.warn('没有连接的设备');
				return resolve();
			}
			uni.closeBLEConnection({
				deviceId: this.deviceId,
				success: (res) => {
					console.log('断开设备连接成功', res);
					this.deviceId = null;
					resolve(res)
				},
				fail: (err) => {
					console.error('断开设备连接失败', err);
					resolve(err)
				}
			});
		});
	}

	/**
	 * 发送数据到设备
	 * @param {Object} buffer
	 */
	WriteBLECharacteristicValue(buffer) {
		var that = this

		return new Promise((resolve, reject) => {
			if (!that.deviceId || !that.serviceId || !that.write_CharacteristicId) {
				console.warn('设备、服务或特征未设置');
				return reject(new Error('设备、服务或特征未设置'));
			}

			uni.writeBLECharacteristicValue({
				deviceId: that.deviceId,
				serviceId: that.serviceId,
				characteristicId: that.write_CharacteristicId,
				value: buffer,
				success: (res) => {
					console.log('发送数据成功', res);

					// 监听特征值变化以等待回复
					const listener = (result) => {
						console.log('收到蓝牙设备回复:', result)
						if (result.deviceId === that.deviceId && result.serviceId ===
							that.serviceId && result.characteristicId.indexOf(that
								.read_CharacteristicId) >= 0) {
							console.log('收到蓝牙设备回复:', result.value)
							// 取消监听特征值变化  
							uni.offBLECharacteristicValueChange(function(res) {}, listener)

							//将监听内容返回
							resolve(result.value)
						}
					}

					uni.onBLECharacteristicValueChange(listener)
				},
				fail: (err) => {
					console.error('发送数据失败', err);
					resolve(err)
				}
			});
		});
	}

	/**
	 * 获取蓝牙设备的所有服务
	 */
	GetBLEDeviceServices() {
		return new Promise((resolve, reject) => {
			if (!this.deviceId) {
				console.warn('没有连接的设备');
				return reject(new Error('没有连接的设备'));
			}
			uni.getBLEDeviceServices({
				success: (res) => {
					console.log('扫描服务成功', res);
					resolve(res)
				},
				fail: (err) => {
					console.error('扫描服务失败', err);
					resolve(err)
				}
			});
		});
	}

	/**
	 * 获取蓝牙设备指定服务中所有特征值
	 */
	GetBLEDeviceCharacteristics() {
		return new Promise((resolve, reject) => {
			uni.getBLEDeviceCharacteristics({
				success: (res) => {
					console.log('获取特征值成功', res);
					resolve(res)
				},
				fail: (err) => {
					console.error('获取特征值失败', err);
					resolve(err)
				}
			})
		})
	}

	/**
	 * 启用低功耗蓝牙设备特征值变化时的notify功能，订阅特征值
	 * @param {Object} serviceId
	 */
	NotifyBLECharacteristicValueChange(serviceId) {
		return new Promise((resolve, reject) => {
			if (!this.deviceId || !serviceId) {
				console.warn('设备或服务未设置');
				return reject(new Error('设备或服务未设置'));
			}

			uni.notifyBLECharacteristicValueChange({
				state: true, // 启用notify功能  
				deviceId: this.deviceId,
				serviceId: serviceId,
				success: (res) => {
					console.log('启用notify成功', res);
					resolve(res)
				},
				fail: (err) => {
					console.error('启用notify失败', err);
					resolve(err)
				}
			});
		});
	}
}

export default BluetoothManager;