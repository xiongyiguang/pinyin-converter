# 微软拼音 DAT 生成与查看小工具

这是一个本地运行的轻量 Web 工具，用来处理微软拼音 DAT 文件。

它支持两件事：

- 从中文姓名列表生成微软拼音可导入的 DAT 文件
- 上传已有 DAT 文件，反向查看里面的短语和编码

本项目只做本地文件生成和查看，不会自动导入微软拼音，不会修改系统设置，不会写注册表，也不做安装程序。

## 支持的 DAT 类型

本工具支持两种微软拼音 DAT。

| 类型 | 输出文件 | ImeWlConverter 格式 | 编码方式 | 用途 |
| --- | --- | --- | --- | --- |
| 用户自定义短语 DAT | `dist/UserDefinedPhrase.dat` | `win10mspy` | 拼音首字母 | 导入到微软拼音“用户自定义短语” |
| 自学习词汇 DAT | `dist/SelfStudyPhrase.dat` | `win10mspyss` | 全拼编码 | 导入到微软拼音“自学习词汇” |

用户自定义短语示例：

```text
张三 -> zs
王小明 -> wxm
```

自学习词汇示例：

```text
张三 -> zhang san
王小明 -> wang xiao ming
```

自学习词汇不能使用首字母，必须使用全拼编码。

## 页面功能

页面分为两个独立板块。

### 生成 DAT

用于从姓名列表生成 DAT。

流程：

1. 选择生成模式
2. 手工输入姓名，或上传 `txt/csv/xlsx`
3. 点击“解析并预览”
4. 在表格里检查并手工修改编码
5. 点击“生成 DAT 文件”
6. 点击“下载 DAT 文件”

生成模式说明：

- `用户自定义短语 DAT（首字母，win10mspy）`：生成 `UserDefinedPhrase.dat`
- `自学习词汇 DAT（全拼，win10mspyss）`：生成 `SelfStudyPhrase.dat`

### 查看 DAT

用于上传已有 DAT 并查看内容。

流程：

1. 在“查看已导出的 DAT 文件”板块选择 `.dat` 文件
2. 点击“查看 DAT 文件”
3. 页面自动识别 DAT 类型
4. 独立表格显示短语和编码

查看功能支持自动识别：

- 文件头 `mschxudp`：用户自定义短语 DAT
- 文件头 `55 aa 88 81`：自学习词汇 DAT

如果文件头无法识别，才会使用页面上方的“生成模式”作为兜底解析类型。

## DAT 在 Windows 里的用途

### 用户自定义短语 DAT

Windows 设置路径：

```text
语言和区域 -> Microsoft 拼音 -> 词典和自学习 -> 用户自定义短语
```

点击“导入”，选择本工具生成的 `UserDefinedPhrase.dat`。

![微软拼音用户自定义短语导入位置](docs/images/ms-pinyin-custom-phrase-import.svg)

### 自学习词汇 DAT

选择“自学习词汇 DAT（全拼，win10mspyss）”时，本工具生成 `SelfStudyPhrase.dat`。

这类 DAT 对应微软拼音自学习词汇导入导出，不是上图里的“用户自定义短语”入口。

`ImeWlConverter` 官方说明提到，自学习词库最多约 2 万条。数据太大可能导致 Windows 设置 App 卡死，不建议一次导入过大的文件。

## 运行环境

需要：

- Python 3.10+
- `ImeWlConverter` 命令行工具

当前项目已经适配 Linux 版 `ImeWlConverterCmd`。如果项目目录下存在：

```text
imewlconverter_linux/publish/linux-x64/ImeWlConverterCmd
```

页面里的 `ImeWlConverter 路径` 可以不填，后端会默认使用它。

也可以手动填写转换器路径，例如：

```text
/home/xiong/dev/pinyin-converter/imewlconverter_linux/publish/linux-x64/ImeWlConverterCmd
```

如果在 Windows Python 下运行，也可以填写 Windows 路径，例如：

```text
C:\Users\xiong\Desktop\imewlconverter_win-x64\ImeWlConverterCmd.exe
```

如果在 WSL 里运行，不建议调用 Windows `.exe`，优先使用 Linux 版 `ImeWlConverterCmd`。

## 安装与启动

进入项目目录：

```bash
cd ~/dev/pinyin-converter
```

创建并进入虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

安装依赖：

```bash
pip install -r requirements.txt
```

启动：

```bash
python app.py
```

浏览器打开：

```text
http://localhost:5000
```

Flask 启动时出现下面提示是正常的：

```text
WARNING: This is a development server. Do not use it in a production deployment.
```

这是开发服务器提醒，本地使用可以忽略。

如果提示端口被占用：

```text
Address already in use
Port 5000 is in use
```

说明已有服务在运行。可以直接打开 `http://localhost:5000`，或者杀掉旧进程：

```bash
fuser -k 5000/tcp
python app.py
```

## 文件输入规则

### 手工输入

一行一个姓名：

```text
张三
李四
王小明
```

### txt

一行一个姓名。

### csv

- 默认读取第一列
- 如果表头中有 `姓名`、`name` 或 `names`，优先读取该列
- 自动忽略空行

### xlsx

- 默认读取第一个 sheet
- 默认读取第一列
- 如果第一行中有 `姓名`、`name` 或 `names`，优先读取该列
- 自动忽略空行

示例文件在 `samples/`：

- [names_example.txt](samples/names_example.txt)
- [names_example.csv](samples/names_example.csv)
- `names_example.xlsx`

## 编码和去重规则

通用规则：

- 自动清理姓名首尾空格
- 自动去掉姓名中的空格和特殊符号
- 编码统一转小写
- 同一个“姓名 + 编码”完全重复时只保留一条
- 同名但编码不同，允许同时保留

用户自定义短语模式：

- 默认取每个字拼音首字母
- 表格里可以手工修改首字母
- 适合处理多音字、少数民族姓名、英文名夹中文名等情况

自学习词汇模式：

- 默认生成空格分隔全拼
- 表格里可以手工修改全拼
- 多字词编码必须用空格分隔，例如 `zhang san`

## 中间文件和输出目录

运行后会生成或使用这些目录：

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

`dist/` 放最终下载文件。

`work/` 放中间文件和转换器日志，方便排查。

`output/last_request.json` 保存最近一次生成请求的记录。

## 中间文件格式

本项目会先生成 `work/names_normalized.txt`，再调用 `ImeWlConverter`。

中间文件使用 `sgpy` 文本格式。

用户自定义短语模式：

```text
'z's 张三
'l's 李四
'w'x'm 王小明
```

自学习词汇模式：

```text
'zhang'san 张三
'li'si 李四
'wang'xiao'ming 王小明
```

## ImeWlConverter 调用方式

本项目不研究微软拼音 DAT 二进制格式，最终转换交给 `ImeWlConverter`。

生成用户自定义短语 DAT 时，核心转换等价于：

```bash
ImeWlConverterCmd -i:sgpy work/names_normalized.txt -o:win10mspy dist/UserDefinedPhrase.dat
```

生成自学习词汇 DAT 时，核心转换等价于：

```bash
ImeWlConverterCmd -i:sgpy work/names_normalized.txt -o:win10mspyss dist/SelfStudyPhrase.dat
```

查看用户自定义短语 DAT 时，核心转换等价于：

```bash
ImeWlConverterCmd -i:win10mspy input.dat -o:sgpy work/inspect_output_sgpy.txt
```

查看自学习词汇 DAT 时，核心转换等价于：

```bash
ImeWlConverterCmd -i:win10mspyss input.dat -o:sgpy work/inspect_output_sgpy.txt
```

注意：某些 `ImeWlConverter` 版本不会直接把真实 DAT 写到指定输出路径，而是先输出一行“词库文件在：...”。本项目已做兼容，会自动读取真实 DAT 再复制到 `dist/`。

## 常见错误

### 页面打不开

确认服务已经启动，并访问：

```text
http://localhost:5000
```

如果 5000 端口被占用，先杀旧进程：

```bash
fuser -k 5000/tcp
python app.py
```

### ImeWlConverter 路径不存在

确认页面里的路径存在，或者确认 Linux 版转换器在：

```text
imewlconverter_linux/publish/linux-x64/ImeWlConverterCmd
```

### 调用转换器失败

查看：

```text
work/converter_stdout.log
work/converter_stderr.log
```

如果在 WSL 里调用 Windows `.exe`，可能失败。建议改用 Linux 版 `ImeWlConverterCmd`。

### DAT 解析失败，未生成可读内容

常见原因：

- DAT 文件损坏
- 上传的不是本工具支持的两种 DAT
- 转换器无法识别该 DAT 版本

查看：

```text
work/inspect_stdout.log
work/inspect_stderr.log
```

### 下载的 DAT 里只有“词库文件在：...”

这是部分 `ImeWlConverter` 版本的输出行为。本项目已兼容该情况。如果仍出现，重启服务后重新生成。

## 验证建议

可以先用下面 5 个名字做完整测试：

```text
张三
李四
王小明
曾小贤
单依纯
```

建议分别测试：

- 用户自定义短语 DAT：确认生成 `UserDefinedPhrase.dat`
- 自学习词汇 DAT：确认生成 `SelfStudyPhrase.dat`
- 查看 DAT：分别上传两种 DAT，确认能识别类型并显示内容

如果多音字不符合预期，直接在表格里手工修改编码后再生成。
