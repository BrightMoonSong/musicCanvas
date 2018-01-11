# 音乐可视化

````

第一步：cnpm i -g express-generator
	安装express-generator生成器（类似脚手架的一个工具）
 	查看express是否安装成功用express --version(注意这里不要用--v)
	可以用express -help查看都有啥命令
第二步：	express server  很快就会生成一个server文件夹
	bin-----------可执行文件---启动时可以node bin/www
	public--------静态资源
	routes--------路由
	views---------视图
	app.js--------入口
	package.json--
第三步：如果不用jade,换HTML JS的方法
	cnpm i ejs --save
	在上面加上 var ejs = require('ejs');
	将app.js中的（app.set('view engine', 'jade');）替换为
	app.engine('.html',ejs.__express);
	app.set('view engine', 'html');
	注：尽量用jade，官网推荐，性能优越
