#  使用node-gyp为nodejs编译c/c++扩展

## windows编译环境搭建

### 1. 安装依赖
- .net4.5及以上版本(win7 sp1 及以上版本)

使用管理员权限打开cmd/PowerShell
``` bash
# 安装 cnpm, 国内最快的npm包管理软件
npm install -g cnpm
cnpm install -g node-gyp
# 安装依赖软件(python,visual-studio-build-tools 14.0)
cnpm install --global --production windows-build-tools
# 安装完成后将 %用户目录%.windows-build-tools\python27 加入PATH环境变量
```

### 2. 开始编译

下载源代码

链接: [https://pan.baidu.com/s/1miOMmAc](https://pan.baidu.com/s/1miOMmAc) 密码: 9dem

在源代码根目录打开cmd/PowerShell
``` bash
cnpm install
node-gyp configure
node-gyp build
```

