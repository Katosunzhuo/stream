#Stream 上传插件

Stream 是解决不同浏览器上传文件的插件，是Uploadify的Flash版和Html5版的结合！

#Stream 简介
Stream 是根据某网的文件上传插件加工而来，支持不同平台（Windows, Linux, Mac, Android, iOS）下，主流浏览器（IE7+, Chrome, Firefox, Safari, 其他）的上传工作，当然在Html5标准下，还支持文件的断点续传功能，有效解决大文件的Web上传问题！

#主要特征
1. 支持HTML5、Flash两种方式（跨域）上传

2. 多文件一起上传

3. HTML5支持断点续传，拖拽等新特性

4. 兼容性好IE7+, FF3.6+, Chrome*，Safari4+，遨游等主流浏览器

5. 进度条、速度、剩余时间等附属信息

6. `选择文件的按钮`可以自定义

7. 简单的参数配置实现 灵活多变的功能

8. 支持文件夹上传（Chrome21+, Opera15+）

9. 支持自定义UI（V1.4+）


# 快速开始 - 克隆项目
1. clone Stream项目: git clone http://git.oschina.net/jiangdx/stream.git
2. 到Stream项目下: cd stream
3. 在Tomcat中运行Stream: mvn tomcat7:run
   (如遇中文问题，请先设置参数：export MAVEN_OPTS="${MAVEN_OPTS} -Dfile.encoding=UTF-8", Windows请设置相应的环境变量)
    
4. 在浏览器中访问Stream插件: http://localhost:8080
5. Enjoy it!!!


# 快速开始 - 下载war包
1. 下载stream-*.war项目包: http://git.oschina.net/jiangdx/stream/attach_files
2. 在容器中部署war包（Tomcat示例）

     I.  将stream-*.war拷贝到webapps目录下

     II. 将stream-*.war重命名为ROOT.war
3. 启动服务器，访问http://localhost:8080
4. Have Fun!!! 


# 其他后台语言实现
	PHP（未实现Form/Flash上传） - 由http://git.oschina.net/zhouhr提供，请参考http://www.twinkling.cn/提供的下载地址中，寻找文件`stream-php.rar`
	
	Perl - https://github.com/iakuf/mojolicious-stream-upload
	
	.Net - https://github.com/oec2003/StreamAspNet


# Demo
	http://p.twinkling.cn


# Document
	http://twinkling.cn
	

# 重要提示
用于生产环境时，请不要直接使用原来的后台代码，请加入相关限制（如认证，Session等等）

# 版本
### v1.9
1. 新增参数formed(强制使用form表单方式上传，以满足类似又拍云这种form-api上传方式)。
2. 重复文件提示onRepeatFile函数。
3. bug修复：文件拖拽上传文件数超过100个的错误；暂停取消再上传；jdk1.7Windows平台可能出现无法重命名的情况。
