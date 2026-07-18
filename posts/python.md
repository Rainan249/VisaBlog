---
title: Python
date: 2026-07-18
tags: [学习笔记]
---
# 一.基础知识
其余与Java相同  不作赘述
## (一)常见数据类型
### 1.分类

| 标准名称     | 描述  | 说明                 |
| -------- | --- | ------------------ |
| int      | 整数  | 数字类型 存放整数          |
| float    | 浮点数 | 数字类型 存放小数          |
| str      | 字符串 | 用引号引起来的都是字符串       |
| bool     | 布尔  | 布尔类型 描述真和假         |
| NoneType | 空值  | 表示空或者无值 仅包含一个值None |
### 2.查看数据类型
#### (1)type方法
- 通过type()语句来得到数据的类型
```python
a = 5
print(type(a))
```
#### (2)isinstance方法
- 查数据是否属于指定的类型，返回的是一个bool值
```python
a = 5
print(isinstance(a,int))
```
### 3.字符串
#### (1)定义方式
##### ①双引号定义
##### ②单引号定义
##### ③三引号定义(定义多行字符串)
```python
s3 = """
    你好
    你好
    你好
"""
```
#### (2)常见的转义字符
![[Pasted image 20260401210013.png]]
#### (3)字符串格式化
##### ①%占位符
```python
s1 = "人生苦短"
s2 = "我用python"
print("你好 我是%s %s"%(s1,s2))
```
##### ② f"内容{变量/表达式}" 
```python
s1 = "人生苦短"
s2 = "我用python"
print(f"你好 我是 {s1}{s2}")
```

### 4.数据类型转换

| 类型          | 函数         |
| ----------- | ---------- |
| 其他类型转为int   | int(...)   |
| 其他类型转为str   | str(...)   |
| 其他类型转为float | float(...) |
| 其他类型转为bool  | bool(...)  |
## (二)算数运算符

| 运算符 | 描述    |
| --- | ----- |
| +   | 加法    |
| -   | 减法    |
| *   | 乘法    |
| /   | 除法    |
| //  | 整除    |
| %   | 求余/取模 |
| **  | 幂指数   |
## (三)比较运算符
- 返回的是布尔类型的值 true / false

| 运算符    | 描述        |
| ------ | --------- |
| a == b | 判断a和b是否相等 |
| a ！= b | 判断a和b是否不等 |
| a > b  | 判断a是否大于b  |
| a < b  | 判断a是否小于b  |
| a >= b | 判断a是否不小于b |
| a <=b  | 判断a是否不大于b |
## (四)逻辑运算符

| 运算符 | 描述      |
| --- | ------- |
| and | 逻辑与(并且) |
| or  | 逻辑或(或者) |
| not | 逻辑非(取反) |
## (五)语句
### 1.if...elif...else语句
```python
a = int(input("请输入"))
if a == 1:
    print("你输入了1")
elif a == 2:
    print("你输入了2")
elif a == 3:
    print("你输入了3")
else:
    print("我不知道")
```
- 可以完成多个条件的判断
- elif可以写多个
- else可有可无
- 多个条件判断是有顺序的 从上到下判断
### 2.match语句
```python
a = input("输入数字")

match a:
    case "1":
        print("周一")
    case "2":
        print("周二")
    case "3":
        print("周三")
    case "4":
        print("周四")
    case "5":
        print("周五")
    case "6"|"7":
        print("周末")
    case _:
        print("输入有误")
```
- 注意用match
- 不匹配 用  _ 代替
### 3.while循环
```python
a = int(input("请输入"))
i = 0
sum = 0
while i <= a:
    if i%2==0:
        sum += i
    i += 1
else:
	print("循环正常结束 执行完毕")
print(sum)
```
### 4.for循环
```python
mes = "hello"
for i in mes:
    print(i)
else:
	print("循环结束")
```
### 5.range语句
- 作用：生成指定规则的数字序列
	- 用法1：range(end)                       获取一个从0开始 到end结束的数字序列  不含end本身
	- 用法2：range(start,end)               获取一个从start开始 到end结束的数字序列  不含end本身
	- 用法3：range（start,end,step)     获取一个从start开始 到end结束  步长为step 不含end的数字序列
### 6.break和continue
#### (1)break
- 不能够单独书写 只能出现循环中 表示结束、跳出的意思
#### (2)continue
- 不能单独书写，只能出现循环中，表示中断本次循环，直接进入下一次循环
# 二.核心语法
## (一)数据存储容器
### 1.列表 list
#### (1)说明
是数据容器中的一类 是一次性可以存储多个数据的
#### (2)定义
`列表名称 = [元素1，元素2，元素3....]`
`s=[22,66,55,44,88]`
#### (3)特点
- 可以储存不同类型的元素
- 元素有序、可以重复、元素可以修改
- 索引
	- 正向索引：从0开始
	- 反向索引：从-1开始
#### (4)语法

| 功能  | 语法              |
| --- | --------------- |
| 查看  | `list[]`        |
| 修改  | `list[0] = 'A'` |
| 删除  | `del list1[3]`  |
#### (5)切片
- 语法：`序列数据[开始索引:结束索引:步长]`      `s[start:end:step]`
- 示例：`s=["A","B","C","D","E","F"]`
	- `s[0:5:1]`结果为`["A","B","C","D","E"]`
	- `S[0:5:2]`结果为`["A","C","E"]`
#### (6)常见方法

| 方法        | 作用                              | 样例                 |
| :-------- | :------------------------------ | :----------------- |
| append()  | 在列表的尾部追加元素                      | s.append(10086)    |
| insert()  | 在指定索引之前，插入该元素                   | s.insert(0, 92)    |
| remove()  | 移除列表中第一个匹配到的值                   | s.remove(75)       |
| pop()     | 删除列表中指定索引位置的元素（如果未指定索引，默认删最后一个） | s.pop(2) / s.pop() |
| sort()    | 对列表进行排序（列表元素的数据类型一致，才可以进行排序）    | s.sort()           |
| reverse() | 反转列表元素                          | s.reverse()        |

### 2.字符串 str
#### (1)说明
是字符的容器 可以存放任意数量的字符 
#### (2)定义
`"python"`、`""python""`、`"""python"""`
#### (3)特点
- 不可变性
- 有序性
- 索引
	- 正向索引：从0开始
	- 反向索引：从-1开始
#### (4)切片
- 语法：`序列对象[开始索引:结束索引:步长]`
#### (5)常用方法
| 方法           | 作用                             | 样例                       |
| ------------ | ------------------------------ | ------------------------ |
| find()       | 在字符串中查找子串，返回第一次出现的索引位置，找不到返回-1 | s.find('Python')         |
| count()      | 统计子串在字符串中出现的次数                 | s.count('H')             |
| upper()      | 将字符串中的所有字母转换为大写                | s.upper()                |
| lower()      | 将字符串中的所有字母转换为小写                | s.lower()                |
| split()      | 将字符串按指定分隔符分割成列表                | s.split(' ')             |
| strip()      | 去除字符串两端的空白字符或指定字符              | s.strip() / s.strip('*') |
| replace()    | 将字符串中的指定子串替换为新的子串              | s.replace('H', 'C')      |
| startswith() | 检查字符串是否以指定子串开头，返回布尔值           | s.startswith('P')        |

### 3.元组 tuple
#### (1)说明
是不可变的序列 类似于列表 但是创建后不能修改
#### (2)定义
`元组名称 = (元素1,元素2,.....)`
`元组名称 = tuple()`
#### (3)特点
- 可以存储不同类型的元素
- 元素可以重复、有序、不可以修改(支持索引访问、切片)
#### (4)方法

| 方法       | 作用                     |
| -------- | ---------------------- |
| count( ) | 统计某元素子在元组中出现的次数        |
| index( ) | 查找某个元素在元组中的索引位置(第一次出现) |
#### (5)组包和解包
- 组包(Packing)：将多个值合并到一个容器中(元组、列表)中
- 解包(Unpacking)：将容器(元组、列表)解开成独立的元素 分别赋值给多个变量
```python
# 定义元组, 组包
t1 = (5, 7, 9, 1)
# 定义元组, 组包
t2 = 5, 7, 9, 1

# 基础解包
a, b, c, d = t1

# (*)扩展解包
x, *y, z = t2  # x为5，y为[7, 9]，z为1
s, *o = t2  # s为5，o为[7, 9, 1]
*o, e = t2  # o为[5, 7, 9]，e为1
```
- 说明：在元素解包时，`*`表示收集剩余的所有元素，允许我们处理不确定数量的元素(生成列表，以便于可以进行进一步的处理)
### 4.集合 set
#### (1)说明
是一种无序的、不可重复、可修改的数据容器
#### (2)定义
`s = {"C", "D", "X", "T", "O", "U"}`
`s = set()`
#### (3)特点
- 空集合的定义不可以使用{ },{ }表示的是空字典
- 由于集合是无序的，因此是不支持下标索引访问的
#### (4)常用方法
| 操作            | 含义                                           | 样例                      |
|-----------------|------------------------------------------------|---------------------------|
| add(..)         | 添加元素到集合中                               | s1.add('t')               |
| remove(..)      | 移除集合中的指定元素（指定元素不存在将报错）   | s1.remove('t')            |
| pop()           | 随机删除集合中的元素并返回                     | e = s1.pop()              |
| clear()         | 清空集合                                       | s1.clear()                |
| difference()    | 求取两个集合的差集（包含在第一个集合但不包含在第二个集合的元素） | s1.difference(s2)         |
| union()         | 求取两个集合的并集                             | s1.union(s2)              |
| intersection()  | 求取两个集合的交集                             | s1.intersection(s2)       |
#### (5)结合操作运算符
`&`：交集
`|`：并集
`-`：差集
### 5.字典 dict
#### (1)说明
使用键值对(key:value)来存储数据 每一个键都对应一个值 通过键(key)可以快速找到值(value)
#### (2)定义
```python
# 定义字典字典名称 = {key: value, key:value, key:value …}
# 定义空字典
字典名称 = {}
字典名称 = dict()

# 根据key获取value
值 = 字典名称[key]

```
```python
# 定义字典
dict1 = {"王林": 675, "李慕婉": 608, "许立国": 478, …}
# 定义空字典
dict2 = {}
dict3 = dict()

# 根据key获取value
score = dict1["李思"]

```
#### (3)特点
- 键值对（key：value）存储、键（key）不能重复、可修改
- value可以是任意类型 而key必须是不可变类型(不能为list、set、dict)
- 字典内的key不允许重复，如果重复定义，后面的会覆盖前面的
- 字典是没有索引下标的，不能根据索引获取值，只能根据key获取value
#### (4)常用操作
`dict1 = {"小智": 675, "李思": 608, "李琪": 478, "小黑": 545, "温韬": 429}`

| 类型  | 操作                | 含义                          | 样例                      |
| :-- | :---------------- | :-------------------------- | :---------------------- |
| **添加**  | 字典名称[key] = value | 往指定字典中添加key-value键值对        | dict1["涛哥"] = 668       |
| **删除**  | 字典名称.pop(key)     | 删除字典中指定的key，并返回该key对应的value | score = dict1.pop("涛哥") |
| **删除**  | del 字典名称[key]     | 删除字典中指定的键值对                 | del dict1["涛哥"]         |
| **修改**  | 字典名称[key] = value | 修改字典中指定的key对应的值             | dict1["小智"] = 658       |
| **查询**  | 字典名称[key]         | 根据key获取value                | dict1["涛哥"]             |
| **查询**  | 字典名称.get(key)     | 根据key获取value                | dict1.get("涛哥")         |
| **查询**  | 字典名称.keys()       | 获取所有的key                    | dict1.keys()            |
| **查询**  | 字典名称.values()     | 获取所有的value                  | dict1.values()          |
| **查询**  | 字典名称.items()      | 获取所有的key-value键值对           | dict1.items()           |
### 6.总结
| 特性 | 字符串 (str) | 列表 (list) | 元组 (tuple) | 集合 (set) | 字典 (dict) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 有序性 | 有序 | 有序 | 有序 | 无序 | 有序(3.7+) |
| 重复元素 | 允许 | 允许 | 允许 | 不允许 | key:不允许 |
| 可变性 | 不可变 | 可变 | 不可变 | 可变 | 可变 |
| 索引访问 | 支持 | 支持 | 支持 | 不支持 | 不支持 |
| 切片操作 | 支持 | 支持 | 支持 | 不支持 | 不支持 |
| 使用场景 | 文本处理 | 有序可重复数据集合 | 固定数据记录 | 去重数据集合 | 键值对 |

## (二)函数
### 1.函数定义
- 函数是组织好的，可重复使用的，用来实现特定功能的代码片段
```python
# 定义函数
def 函数名(参数列表):
    函数体
    ......
    return 返回值

# 调用函数
函数名(参数)
```
- 函数必须先定义再调用
- 函数定义时并不会执行 只有在调用函数时 函数体的逻辑才会运行
- 函数中通过缩进来描述归属关系
### 2.函数说明文档
- 是写在函数开头 用三个引号包裹的字符串 用于解释函数的功能 用于解释函数的功能、参数、返回值等信息
```python
# 定义一个函数, 根据半径, 计算圆的周长、面积
def circle_area_len(r):   
	"""
	该函数用于根据圆的半径, 计算圆的面积和圆的周长
	:param r: 圆的半径
	:return: 圆的面积 , 圆的周长
	"""
	return 3.14 * r * r, 2 * 3.14 * r
al = circle_area_len(10)
print(al)
```

### 3.函数变量的作用域
#### (1)全局变量
在函数之外定义的变量，称之为全局变量，在整个文件中(包括函数内)都可以使用(通常定义在文件的顶部)
#### (2)局部变量
在函数内部定义的变量，称之为局部变量，只能在该函数内部使用，外部无法访问(函数执行完毕后，会自动销毁其内部局部变量)
#### (3)global关键字
```python
num1 = 1 
# 全局变量
def fun1():   
	num1 = 100 
	# 局部变量  
	 print(num1)
fun1() # 100
print(num1) # 1
```
```python
num1 = 1 
# 全局变量
def fun1():
    global num1  
    num1 = 100 # 修改全局变量num1  
    print(num1)
fun1() # 100
print(num1) # 1
```
### 4.函数参数详解
#### (1)传参方式
##### ①位置参数
```python
# 定义函数
def reg_stu(name, age, gender, city):
    print(f"注册成功,姓名:{name}, 年龄:{age}, 性别:{gender}, 城市:{city}")
    return {"name": name, "age": age, "gender": gender, "city": city}

# 调用函数
stu = reg_stu("张三", 18, "男", "北京")
print(stu)
```
- 调用函数时参数顺序与定义函数时参数完全一致
##### ②关键字参数
```python
# 定义函数
def reg_stu(name, age, gender, city):
    print(f"注册成功,姓名:{name}, 年龄:{age}, 性别:{gender}, 城市:{city}")
    return {"name": name, "age": age, "gender": gender, "city": city}

# 调用函数
stu = reg_stu(name="张三", age=18, gender="男", city="北京")
print(stu)

stu2 = reg_stu(gender="男", name="王武", city="上海", age=22)
print(stu2)

stu2 = reg_stu("赵四", 28, gender="男", city="上海")
print(stu2)
```
- 如果位置参数与关键字参数混用，关键字参数必须在位置参数之后(关键字参数之间，没有顺序要求)
##### ③对比

| 传参方式 | 位置参数             | 关键字参数        |
| ---- | ---------------- | ------------ |
| 优点   | 简洁               | 可读性强，易维护和扩展  |
| 缺点   | 可读性差，易出错，维护难     | 代码繁琐         |
| 场景   | 参数少(不超多3个)，且顺序自然 | 参数较多，或易混淆的场景 |
>黄金法则：半年后看不出每个参数的含义 则应该使用关键字参数
#### (2)默认参数
- 默认参数也称为缺省参数，用于在定义函数时，为参数提供默认值，调用函数时，可以不传递有默认值的参数
```python
# 定义函数
def reg_stu(name, age, gender, city='北京'):
    print(f"注册成功,姓名:{name}, 年龄:{age}, 性别:{gender}, 城市:{city}")
    return {"name": name, "age": age, "gender": gender, "city": city}

# 调用函数
stu = reg_stu("张三", 18, "男")
print(stu)

stu = reg_stu("赵四", 22, "男", "深圳")
print(stu)
```
- 默认参数必须放在没有默认值的参数列表的后面，一个函数在定义时是可以设置多个默认参数的
- 函数调用时，如果为默认参数传递了值，则会修改默认的参数值；如果没有传递该参数，则直接使用默认值
#### (3)不定长参数
- 不定长参数也叫可变参数 用于函数定义及调用时参数个数不确定(0或多个)的场景
##### ①位置传递  `*args`
```python
# 定义函数
def calc_data(*args):
    min_data = min(args)
    max_data = max(args)
    avg_data = sum(args) / len(args)
    return min_data, max_data, round(avg_data, 1)

# 调用函数
data = calc_data(10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
print(data)

data = calc_data(100, 200, 300, 400, 500)
print(data)
```
- 传递的所有的匹配的位置参数都会被args变量收集，这些参数会合并封装为一个元组，args是元组类型(注意并不会封装关键字参数)
- args只是约定俗成的变量名，并不是关键字，这里可以使用任何合法的变量名
##### ②关键字传递`**kwargs`
```python
# 定义函数
def calc_data(*args, **kwargs):
    min_data = min(args)
    max_data = max(args)
    avg_data = sum(args) / len(args)

    if kwargs.get('round'):
        avg_data = round(avg_data, kwargs.get('round'))

    return min_data, max_data, avg_data

data = calc_data(100, 200, 300, 400, round=2, count=0)
print(data)

data = calc_data(33, 11, 28, 91, 32, 75, 49)
print(data)
```
- 参数是以"键=值"形式传递的关键字参数 这些键值对参数都会被kwargs接受 并且合并封装为一个字典类型
- kwrags只是约定俗成的变量名 并不是关键字 这里可以使用合法的变量名

### 5.匿名函数
- 指的是没有名称的函数 需要通过lambda表达式来声明函数 可以简化简单函数的书写(单行表达式)
```python
函数名 = lambda 参数列表:函数体
```
```python
add = lambda a,b:a+b  
print(add(3,4))
```
### 6.类型注解
#### (1)基本注解
```python
# 定义变量a: int = 695
score: float = 98.5
hobby: str = "Python"
flag: bool = True
pic: None = None

names: list[str] = ["A", "C", "E"]
phones: set[str] = {"13309091111", "15209109121"}
options: dict[str, int] = {"count": 0, "total": 0}
goods: tuple[str,int,int] = ("手机", 5999, 1)

```
- 这里添加只是注解 不是强制约束
#### (2)类型注解
```python
def calc(scores: list[int]) -> float:
    return sum(scores) / len(scores)


def calc_data(scores: list[int]) -> tuple[int, int, float]:
    max_v = max(scores)
    min_v = min(scores)
    avg_v = sum(scores) / len(scores)
    return max_v, min_v, avg_v
```
#### (3)模块化
- 一个 . py文件就是一个模块 模块是Python程序的基本组织单位 在模块中可以定义变量、函数、类，以及可执行的代码
##### ①模块导入方式

| 导入形式                          | 代码样例                          | 调用方式       | 调用示例                |
|-----------------------------------|-----------------------------------|----------------|-------------------------|
| `import 模块名`                   | `import random, os`               | 模块名.功能名  | `random.randint(10, 100)`|
| `import 模块名 as 别名`           | `import random as rd`             | 别名.功能名    | `rd.randint(10, 100)`   |
| `from 模块名 import 功能名`       | `from random import randint,choice`| 功能名         | `randint(10, 100)`      |
| `from 模块名 import 功能名 as 别名`| `from random import randint as rint`| 别名           | `rint(10, 100)`         |
| `from 模块名 import *`            | `from random import *`            | 功能名         | `randint(10, 100)`      |
##### ②软件包的导入方式

| 导入形式 | 代码样例 | 调用方式 | 调用方式 |
|---|---|---|---|
| import 包名.模块名 | import utils.my_fun | 包名.模块名.功能名 | utils.my_fun.log_separator1() |
| from 包名 import 模块名 | from utils import my_fun | 模块名.功能名 | my_fun.log_separator1() |
| from 包名 import * | from utils import * | 模块名.功能名 | my_fun.log_separator1() |
| from 包名.模块名 import 功能名 | from utils.my_fun import log_separator1 | 功能名 | log_separator1() |
| from 包名.模块名 import * | from utils.my_fun import * | 功能名 | log_separator1() |
## (三)面向对象的编程
### 1.类与对象
```python
# 定义类
class 类名:
    pass

# 创建对象
对象名 = 类名()
对象名.属性名1 = 属性值1
对象名.属性名2 = 属性值2
```
```python
# 定义类
class Car:
    pass
# 创建对象
c1 = Car()
c1.brand = "BMW"
c1.name = "X5"
c1.price = 500000
print(c1.__dict__)
```
- 类名的命名规范，遵循大驼峰命名法，每个单词的首字母都是大写，单词之间没有分隔符，比如：UserInfo，UserAccount 
- dict__是Python中用户自定义类实例的一个特殊属性，用于以字典形式存储对象的属性 
### 2.实例对象
```python
# 定义类
class 类名:
    def __init__(self, 形参列表):
       self.属性名 = 参数值
       self.属性名 = 参数值
    
    def 方法名(self, 形参列表):
       ...
    def 方法名(self, 形参列表):
       ...
    
# 创建对象
对象名 = 类名(参数列表)
对象名.方法名(实参)
```
```python
class Car:
    def __init__(self, brand, name, price):
        self.brand = brand
        self.name = name
        self.price = price

    def running(self):
        print(f"{self.brand} {self.name} 正在高速行驶...")

    def total_cost(self, discount, rate):
        return self.price * discount + self.price * rate


c1 = Car("BMW", "X5", 500000)
total_cost = c1.total_cost(0.9, 0.1)
print(f"提车总价为: {total_cost:.0f}")

c1.running()
```
### 3.魔法方法
| 魔法方法 | 描述 |
|---|---|
| `__init__` | 初始化方法 |
| `__str__` | 字符串表示的方法 |
| `__eq__` | 比较两个对象是否相等 (equal) |
| `__lt__`, `__le__`, `__gt__`, `__ge__` | 支持比较两个对象的大小(小于(less than), 小于等于(less than or equal), 大于(greater than), 大于等于(greater than or equal)) |
- 无需手动掉用 python会自动调用
### 4.实例属性和类属性
#### (1)实例属性
- 实例属性属于每个具体对象的属性，每个对象都是独立的（各个对象特有的数据）
#### (2)类属性
- 类属性是属于类本身的属性，所有实例共享的。（所有对象共享的数据或配置）
tips:
```python
class Car:
    wheel = 4          # 轮胎数量
    tax_rate = 0.1     # 购置税

    def __init__(self, c_brand, c_name, c_price):
        self.brand = c_brand
        self.name = c_name
        self.price = c_price

    def running(self):
        print(f"{self.brand} {self.name} 正在高速行驶...")


c1 = Car("BYD", "汉", 180000)
c2 = Car("Tesla", "Model Y", 260000)
```
### 5.异常
- 程序运行中出现的错误 会中断正常的执行流程
#### (1)作用
- 保证逻辑的正确性  避免程序执行混乱
- 在开发阶段 尽可能早的发现问题 保证程序的正常执行
#### (2)捕获异常
```python
try：
    可能出现异常的业务代码1
    可能出现异常的业务代码2
    ...
except [异常类型 as 变量名]:
    出现异常时的预案
[finally:
    不管是否出现异常, 都会执行的代码 ]
```
```python
try:
    print("= = = = = = = = = = = =")
    print(my_name)
    print("= = = = = = = = = = = =")
except NameError as e:
    print("程序运行报错, 错误信息: ", e)
finally:
    print("释放资源 ~")
```