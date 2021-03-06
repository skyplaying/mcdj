/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var hosts = [{
	HTTP: 'https',
	WS: 'wss',
	NAME: 'mcdj.qipinke.com'
}, {
	HTTP: 'http',
	WS: 'ws',
	NAME: '192.168.0.240:8080' //杨
}, {
	HTTP: 'https',
	WS: 'ws',
	NAME: 'test.qipinke.com' // 新内网穿透
} ]

var index = 0;

var host = `${hosts[index].HTTP}://${hosts[index].NAME}`;

var config = {

	// 下面的地址配合云端 Demo 工作  
	service: {
		host,
		// 登录地址，用于建立会话
		loginUrl: `${host}/petshare_api_server/api/auth/login`,
		
        // loginUrl: `${host}/petshare_api_server_test/api/auth/login`,
		// 测试的请求地址，用于测试会话
		requestUrl: `${host}/petshare_api_server_test/auth/user`,

		// 信道服务地址
		tunnelUrl: `${hosts[index].WS}://${hosts[index].NAME}/petshare_api_server/websocket`,

		//测试信道服务地址
		// tunnelUrl: `${hosts[index].WS}://${hosts[index].NAME}/petshare_api_server_test/websocket`,


		// 接口地址
		api: `${host}/petshare_api_server/api/`,

		//测试接口地址
		// api:`${host}/petshare_api_server_test/api/`,

	}

};

module.exports = config;
