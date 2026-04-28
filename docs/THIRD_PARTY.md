# 第三方依赖和公开项目说明

本文档说明本项目使用的公开项目、第三方库和授权边界。

## DAT 转换能力来源

本项目生成和查看微软拼音 DAT 文件时，使用公开项目 `ImeWlConverter` 的命令行工具。

| 项目 | 说明 |
| --- | --- |
| 中文名 | 深蓝词库转换 |
| 英文名 | ImeWlConverter |
| GitHub | `https://github.com/studyzy/imewlconverter` |
| 上游仓库标识 | `studyzy/imewlconverter` |
| 本项目使用方式 | 调用 `ImeWlConverterCmd` 命令行程序 |
| 本项目内置路径 | `imewlconverter_linux/publish/linux-x64/ImeWlConverterCmd` |
| 授权 | GPL-3.0 |
| 授权文本 | [../LICENSES/GPL-3.0.txt](../LICENSES/GPL-3.0.txt) |

本项目使用 `ImeWlConverterCmd` 完成以下格式转换：

- `sgpy -> win10mspy`：生成用户自定义短语 DAT
- `sgpy -> win10mspyss`：生成自学习词汇 DAT
- `win10mspy -> sgpy`：查看用户自定义短语 DAT
- `win10mspyss -> sgpy`：查看自学习词汇 DAT

本项目没有重新实现微软拼音 DAT 的底层二进制格式。DAT 编解码能力归属于 `ImeWlConverter` 项目。

## 本项目与 ImeWlConverter 的关系

本项目是一个面向姓名批量处理的本地 Web 包装工具，主要提供：

- 姓名输入和文件导入
- 拼音首字母和全拼编码生成
- 生成前预览和人工修正
- Web UI
- 本地文件下载和查看

`ImeWlConverter` 提供：

- 输入法词库格式识别
- 微软拼音 DAT 读写
- 命令行格式转换

二者不是同一个项目。本项目不是 `ImeWlConverter` 官方项目，也不代表其维护者发布。

## 授权注意事项

仓库内包含 `ImeWlConverterCmd` 二进制文件。该文件来自 GPL-3.0 授权项目 `studyzy/imewlconverter`。

维护时需要注意：

- 保留 GPL-3.0 授权文本
- 保留上游项目名称和仓库地址
- 不要把 `ImeWlConverter` 的 DAT 转换能力描述成本项目原创
- 如果更新内置二进制，应同步记录来源版本或下载来源
- 如果对 `ImeWlConverter` 做了修改并分发，应按 GPL-3.0 要求提供对应源代码

当前仓库没有提交展开后的 `imewlconverter-master/` 源码目录，只提交了运行所需的 Linux x64 命令行二进制。

## Python 依赖

Python 依赖由 [requirements.txt](../requirements.txt) 管理。

| 包 | 用途 | 上游 |
| --- | --- | --- |
| `Flask` | 本地 Web 服务、路由、模板渲染、文件下载 | `https://github.com/pallets/flask` |
| `openpyxl` | 读取 `.xlsx` 文件 | `https://openpyxl.readthedocs.io/` |
| `pypinyin` | 汉字转拼音、生成拼音首字母 | `https://github.com/mozillazg/python-pinyin` |

这些依赖通过 `pip install -r requirements.txt` 安装，不随仓库提交其源码。

## 前端和运行时

本项目页面没有引入第三方前端框架。页面结构、交互脚本和样式位于：

- [../templates/index.html](../templates/index.html)
- [../static/app.js](../static/app.js)
- [../static/style.css](../static/style.css)

浏览器端交互由原生 HTML、CSS 和 JavaScript 实现。

