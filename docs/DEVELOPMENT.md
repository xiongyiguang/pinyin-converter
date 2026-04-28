# 开发文档

本文档面向维护者，说明项目结构、运行方式、转换流程和常见维护注意事项。

## 本地运行

```bash
cd ~/dev/pinyin-converter
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

默认访问地址：

```text
http://localhost:5000
```

Flask 以 debug 模式运行，修改 Python、模板或静态文件后会自动重载。

## 主要模块

| 文件 | 责任 |
| --- | --- |
| `app.py` | Flask 路由、姓名解析、编码生成、文件读写、调用 `ImeWlConverterCmd` |
| `templates/index.html` | 页面结构 |
| `static/app.js` | 前端状态、文件上传、预览、生成、查看 DAT |
| `static/style.css` | 页面样式 |
| `samples/` | 输入样例 |
| `docs/` | 项目文档和说明图片 |
| `LICENSES/` | 第三方许可证文本 |

## 运行目录

这些目录由程序运行时使用：

```text
dist/
  UserDefinedPhrase.dat
  SelfStudyPhrase.dat

work/
  names_normalized.txt
  converter_stdout.log
  converter_stderr.log
  inspect_input.dat
  inspect_output_sgpy.txt
  inspect_stdout.log
  inspect_stderr.log

output/
  last_request.json
```

仓库只提交这些目录的 `.gitkeep`。实际生成的 DAT、中间文件和日志由 `.gitignore` 排除。

## 转换流程

生成 DAT：

1. 前端提交手工输入或上传文件
2. `app.py` 读取 `txt`、`csv`、`xlsx`
3. 后端按生成模式构造编码
4. 前端展示预览表格，允许用户修改编码
5. 后端写入 `work/names_normalized.txt`
6. 后端调用 `ImeWlConverterCmd`
7. 转换器输出 DAT 到 `dist/`
8. 前端提供下载链接

查看 DAT：

1. 前端上传 `.dat`
2. 后端按文件头识别 DAT 类型
3. 后端调用 `ImeWlConverterCmd` 将 DAT 转成 `sgpy`
4. 后端解析 `sgpy` 文本并返回词条列表

## 编码生成

`custom_phrase`：

- 输出格式：`win10mspy`
- 默认编码：拼音首字母
- 示例：`张三 -> zs`

`self_study`：

- 输出格式：`win10mspyss`
- 默认编码：空格分隔全拼
- 示例：`张三 -> zhang san`

拼音生成依赖 Python 包 `pypinyin`。多音字和特殊姓名不能完全自动判断，用户可以在预览表格中修改编码。

## 转换器路径

默认路径：

```text
imewlconverter_linux/publish/linux-x64/ImeWlConverterCmd
```

后端解析顺序：

1. 使用页面提交的 `converter_path`
2. 如果为空，使用环境变量 `IMEWLCONVERTER_PATH`
3. 如果环境变量为空，使用仓库内默认 Linux x64 转换器

如果传入的是 Windows 路径，后端会把 `C:\...` 转成 WSL 可用的 `/mnt/c/...`。如果传入的是 `.dll`，后端会尝试通过 `dotnet` 启动。

## 依赖

Python 依赖见 [requirements.txt](../requirements.txt)：

- `Flask`：Web 服务和路由
- `openpyxl`：读取 `.xlsx`
- `pypinyin`：生成拼音和首字母

DAT 编解码依赖公开项目 `studyzy/imewlconverter` 提供的命令行工具。归属和授权说明见 [THIRD_PARTY.md](THIRD_PARTY.md)。

## 验证

当前项目没有自动化测试套件。修改后至少运行以下手工检查：

```bash
curl -I http://127.0.0.1:5000
curl -s -X POST -F mode=custom_phrase -F manual_names=张三 http://127.0.0.1:5000/api/parse
```

预期：

- 首页返回 `200 OK`
- `/api/parse` 返回 `张三` 的编码 `zs`

涉及 DAT 生成或查看时，还需要在页面上用 `samples/` 中的样例文件跑完整流程，并确认 `dist/` 中生成的 DAT 文件非空。

## Git 提交约定

建议提交前检查：

```bash
git status --short
git diff --stat
```

不要提交：

- `.venv/`
- `__pycache__/`
- `dist/*.dat`
- `work/*`
- `output/last_request.json`
- 下载压缩包
- 第三方源码展开目录 `imewlconverter-master/`

