---
title: Java
date: 2026-01-01
tags: [生活]
---

# 一.基础知识

## 1.四大结构：

project（工程） module（模块） package（包） class（类）

（每一个都包含于上一个）

## 2.创建关键字：

New project/module/package/class

## 3. IDEA快捷键

| 样式                          | 功能         |
| --------------------------- | ---------- |
| main / psvm 、 sout......    | 快速键入相关代码   |
| Ctrl + D                    | 复制当前数据到下一行 |
| Ctrl + X                    | 删除所在行      |
| Ctrl + Alt + L              | 格式化代码      |
| Alt + Shift + 箭头            | 上下移动当前代码   |
| Ctrl + / , Ctrl + Shift + / | 对代码进行注释    |
| Ctrl+Shift+F                | 整合代码的格式    |

## 4.Java 由sun公司研发，现属于oracle公司（詹姆斯 高斯林）

## 5.Java Develpment Kit （JDK）
Java开发者工具包
## 6.Pass 、 Home 为环境变量

## 7.Java开发的软件，功能最小的单位是一个一个的方法

比如：

```java
public static int sum(int a , int b){
    return a + b;
}
```

```java
public static void printHelloWodld(){
    for (int i = 0;i < 10;i++){
    System.out.println("Hello World")
    }
}
```

## 8.注释

1.单行注释

//注释内容，只能写一行

2.多行注释

```java
           /*  
    注释内容

    注释内容

    */
```

3.文档注释

```java
          /**  
          注释内容  
          注释内容  
         */
```

## 9.JDK JRE JVM

```txt
 JDK ：Java Development Kit (Java开发工具包)

 JRE：Java Runtime Environment(Java运行环境)

 JVM：Java Virtual Machine（Java虚拟机）（运行字节码）

 JDK中包含了JRE  JRE中包含了JVM

 Javac：Java Compiler（Java编译器）（将源码转换为字节码）

（Javac编译并检查语法 Java命令负责运行）

 Java.exe（用于运行编译后的文件  负责启动Java虚拟机并执行字节码 是JVM启动器）
```

## 10.源码 字节码

源码：后缀为xxx.java

字节码（编译之后 为二进制）：后缀为xxx.class

## 11.类

一个Java源文件至多有一个类是public（0个或1个）

一个Java源文件可以包含多个class

如果源文件中没有public类 那么源文件的命名随意

一个源文件有2个class（类） 编译之后字节码有2个

# 二.入门的基本语法

## 1.字面量：程序中能直接书写的数据

| 常用数据    | 生活中的写法  | 程序中该怎么写             | 说明                         |
| ------- | ------- | ------------------- | -------------------------- |
| 整数      | 666，-8  | 666，-8              | 写法一致                       |
| 小数      | 13.14   | 13.14               | 写法一致                       |
| 字符      | A, 0 ,我 | ‘A’‘0’‘我’           | 程序中必须是单引号，有且仅有一个字符         |
| 字符串     | 黑马程序员   | “HelloWorld”“黑马程序员” | 程序中必须是双引号，内容可有可无           |
| 布尔值     | 真、 假    | ture、false          | 只有两个值：true（代表真） false（代表假） |
| 空值      | -       | 值是null              | 一个特殊的值，空值                  |
| 特殊字符字面量 | -       | \t \n               | \n (换行) \t (tab缩进功能)       |

## 2.变量

定义格式：数据类型 变量名称 = 数据； 例如 int age = 18

数据类型：限制内存中只能存储某种数据的形式，例如 int（整型数值）、double（小数类型）

```txt
变量名称：首字母通常小写 要有意义（Java允许使用汉字定义变量名）
```

## 3.储存

数据在计算机中最小的储存单位：字节（byte 简称B） 一个字节占8个比特位（bit 简称b） 因此 1B=8b

## 4.二进制、八进制、十六进制

二进制（0B或者0b开头） 八进制（0开头） 十六进制（0X或者0x开头）

## 5.数据类型

基本数据类型：

| 数据类型           | 内存占用 | 数据范围                                     |
| -------------- | ---- | ---------------------------------------- |
| byte（整型）       | 1    | -128~127                                 |
| short（整型）      | 2    | -32768~32767                             |
| int（整型）        | 4    | -2147483648~2147483647（十位数 大概21亿多）       |
| long（整型）       | 8    | -9223375036854775808~9223372036854775807 |
| float（浮点型 小数）  | 4    | 1.401298 E -45 到3.4028235 E +38          |
| double（浮点型 小数） | 8    | 4.9000000E -324 到1.797693 E +308         |
| char（字符型）      | 2    | 0-65535                                  |
| boolean（布尔型）   | 1    | true ，false                              |

布尔值和整形不通

Bigdecimal

➕－>add()

➖－>subtract（）

✖️－>multiply（）

➗－>devide（）

\ －>remainder（）

引用数据类型：类 （class） 接口（interface） 数组 枚举

## 6.关键字和标识符

关键字：如class void 等

标识符：长度不受限制 都可以用Unicode字符（前128位为ASCII字符集）

开头：字母 美元符号 或 下划线（ _ ）

后续：字母 美元符号 数字 或 下划线（ _ ）

区分大小写 不能与Java中关键字重名 首字母小写 遵循驼峰命名法（如 helloWorld）

tips：类名建议首字母大写 遵循驼峰命名法（如 Student）

## 7.方法

1.示例

定义一个方法 求任意两个整数的和并返回

```java
public static int getSum (int a ,int b)
{
    return a + b;
}
```

定义一个方法 求任意两个整数中的最大值并返回

```java
public static int Max (int a ,int b)
{
    int max = a>b?a:b;
    return max;
}
```

2.如果没有返回结果 返回值类型必须声明称void

打印三行HelloWorld 不需要参数 也不需要返回值

```java
public static void printHelloWorld(){
    System.out.println("HelloWorld");
    System.out.println("HelloWorld");
    System.out.println("HelloWorld");
}
```

3.注意事项

1.方法可以重载（多态性）：一个类中出现了多个方法的名称相同，但是他们的形参列表是不同的，那么这些方法就称为方法重载

```java
public static void printVariable(int a){
    System.out.println(a);
}

public static void printVariable(String str ){
    System.out.println(str) ;
}

public static void printVariable(int a, String str){
    System.out.println(a);
    System.out.println(str);
}
```

2.无返回值的方法中可以直接通过单独的return；立即结束当前方法的执行。

```java
public static void div(int a ;int b)
{
    if (b == 0){
        System.out.println("除数不能为0")；
        return；
    }
    System.out.println(a\b);
}
```

方法名name；参数列表；返回值return type；方法体 body

修饰语：public可见性，人人可见；static静态方法

‍

## 8.类型转换  #易忘

1.自动类型转换

类型范围小的变量（byte），可以直接赋值给类型范围大的变量（int）。

byte —>short(char可以赋值给int) —>int —>long —>float —>double

```java
public class demo{
public static void main(String[]args){
    byte a = 12;
    print(a);//自动类型转换
    }

public static void print(int b){
    System.out.println(b);
    }
}
```

2.强制类型转换

类型范围大的变量，不可以直接赋值给类型小的变量，会报错 ，需要强制类型转换过去

```java
public class demo{
public static void main(){
    int a = 12;
    byte b = (byte) a;//强制类型转换
    print(b);//可能出现数据溢出（补码的知识点）
    }

public static void print(byte c){
    System.out.println(c);
    }
}
```

强制类型转换可能造成数据（丢失）溢出；浮点型强行转成整型，直接丢掉小数部分，保留整数部分返回。

## 9.基本的算数运算符

```java
public static vodi main(String[] args){
    print(a:10, b:2);
    }

public static void print (int a, int b){
    System.out.println(a+b);
    System.out.println(a-b);
    System.out.println(a*b);
    System.out.println(a/b);
    System.out.println(a%b);
    }
```

2.想得到的结果是小数

```
System.out.println(1.0 * a/b)
    或者
System.out.println((double) a/b)
```

3.特殊作用(判断：能算则算 不能算连接在一起)

- +符号在有些情况下可以做连接符
- +符号与字符串运算的时候用作连接符的，其结果依然是一个字符串“abc”+5 —>"abc5"

## 10.构造函数

和类同名 没有返回值（void代表返回值空）

```java
// 定义一个Person类
class Person {
    // 成员变量
    String name;
    int age;

    // 1. 无参构造方法（默认构造方法）
    public Person() {
        // 构造方法中可以初始化成员变量
        name = "无名氏";
        age = 0;
        System.out.println("调用了无参构造方法");
    }

    // 2. 有参构造方法
    public Person(String pName, int pAge) {
        // 通过this关键字引用当前对象的成员变量
        this.name = pName;
        this.age = pAge;
        System.out.println("调用了有参构造方法");
    }

    // 普通方法
    public void introduce() {
        System.out.println("我叫" + name + "，今年" + age + "岁");
    }
}

public class ConstructorDemo {
    public static void main(String[] args) {
        // 创建对象时自动调用构造方法
        Person person1 = new Person();  // 调用无参构造方法
        person1.introduce();  // 输出：我叫无名氏，今年0岁

        Person person2 = new Person("张三", 20);  // 调用有参构造方法
        person2.introduce();  // 输出：我叫张三，今年20岁
    }
}
```

‍

## 11.scanner类

创建：

```java
Scanner scanner = new Scanner(System.in);
```

读取数据：

```java
int num = scanner.nextInt();
```

读取字符串：

```java
String word = scanner.next();//读取一个单词
String line = scanner.nextLine();读取一整行字符串
```

读取浮点数：

```java
float f = scanner.nextFloat();
double d = scanner.nextDouble();
```

关闭资源：

```java
scanner.close();
```

举例：

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // 创建Scanner对象
        Scanner scanner = new Scanner(System.in);

        // 提示用户输入两个整数
        System.out.println("请输入第一个整数：");
        int num1 = scanner.nextInt();

        System.out.println("请输入第二个整数：");
        int num2 = scanner.nextInt();

        // 计算两数之和
        int sum = num1 + num2;
        System.out.println("两数之和为：" + sum);

        // 关闭Scanner
        scanner.close();
    }
}
```

## 12.数组

数组的初始化：

```java
int[] numbers={1,2,3,4,5};//静态初始化
int[] numbers=new int[5];//动态初始化
```

数组的访问：（第一个元素的下表是0）

numbrs[0] 访问数组中第一个元素

numbers[2]=10 将数组中第三个元素改为10

数组的长度：

```java
int length = numbers.length;//获取numbers数组的个数
```

数组的遍历：

普通for循环：

```java
int[] numbers = {1, 2, 3, 4, 5};
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}
```

增强for循环：

```java
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
```

## 13.Scanner类

```java
import java.util.Scanner;
public class ScannerInputExample {
    public static void main(String[] args) {
        // 创建 Scanner 对象，用于从标准输入（键盘）读取数据
        Scanner scanner = new Scanner(System.in);

        // 提示用户输入姓名
        System.out.print("请输入你的姓名: ");
        // 读取用户输入的字符串
        String name = scanner.nextLine();

        // 提示用户输入年龄
        System.out.print("请输入你的年龄: ");
        // 读取用户输入的整数
        int age = scanner.nextInt();

        // 输出用户输入的信息
        System.out.println("你好，" + name + "！你今年 " + age + " 岁了。");

        // 关闭 Scanner 对象
        scanner.close();
    }
}
```

## ‍14.时间复杂度

一共有m个字符 寻找一个指定的字符 时间最大为：O(n)

## 15.补码

#### 定义：简化计算机的运算电路设计

整数的补码就是其本身的二进制表示

负数的补码是其绝对值的二进制表示按位取反后加1

#### 举例：

```txt
   正数：对于正数，其补码与原码相同。例如，十进制数 +5 的原码是 00000101（假设使用 8 位二进制表示），其 	   补码也是 00000101。
```

负数：以 -5 为例，先求出其绝对值 5 的二进制表示为 00000101，然后按位取反得到 11111010，最后加 1，得到 补码 11111011

1

## 16.常见的知识点

### 1.Arrays.Copy方法 #易忘

```java
import java.util.Arrays;//先定义类
public class CopyOfExample {
    public static void main(String[] args) {
// 示例 1：复制 int 数组，新长度小于原长度
        int[] originalIntArray = {1, 2, 3, 4, 5};
        int[] newIntArray1 = Arrays.copyOf(originalIntArray, 3);
        System.out.println("新数组 1（长度小于原长度）: " + Arrays.toString(newIntArray1));
//第一个示例里，newIntArray1 的长度是 3，小于 originalIntArray 的长度，所以它截取了originalIntArray 的前 3 个元素。
        
        
// 示例 2：复制 int 数组，新长度大于原长度
        int[] newIntArray2 = Arrays.copyOf(originalIntArray, 7);
        System.out.println("新数组 2（长度大于原长度）: " + Arrays.toString(newIntArray2));
//第二个示例中，newIntArray2 的长度是 7，大于 originalIntArray 的长度，它复制了 originalIntArray 的所有元素，并用 0 填充剩余的元素。
        
        
// 示例 3：复制 String 数组，新长度小于原长度
        String[] originalStringArray = {"apple", "banana", "cherry", "date"};
        String[] newStringArray1 = Arrays.copyOf(originalStringArray, 2);
        System.out.println("新字符串数组 1（长度小于原长度）: " + Arrays.toString(newStringArray1));
//第三个示例中，newStringArray1 的长度是 2，小于 originalStringArray 的长度，因此它截取了 originalStringArray 的前 2 个元素。
        
        
// 示例 4：复制 String 数组，新长度大于原长度
        String[] newStringArray2 = Arrays.copyOf(originalStringArray, 6);
        System.out.println("新字符串数组 2（长度大于原长度）: " + Arrays.toString(newStringArray2));
//第四个示例中，newStringArray2 的长度是 6，大于 originalStringArray 的长度，它复制了 originalStringArray 的所有元素，并用 null 填充剩余的元素。            
    }
}
```

### 2.values ( )和 enum方法 #易忘

```java
// 定义一个枚举类型
enum Weekday {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

public class EnumValuesExample {
    public static void main(String[] args) {
        // 声明一个 Weekday 类型的数组变量
        Weekday[] allWeekdays;
        // 赋值操作，使用 Weekday.values() 方法获取枚举常量数组
        allWeekdays = Weekday.values();

        // 遍历数组并输出每个枚举常量
        for (Weekday weekday : allWeekdays) {
            System.out.println(weekday);
        }
    }
}
```

### 3.for循环

1.基本for循环

```java
public class BasicForLoopExample {
    public static void main(String[] args) {
        // 使用基本 for 循环输出 1 到 5 的整数
        for (int i = 1; i <= 5; i++) {
            System.out.println(i); }}}
```

2.增强for循环（for each循环）

```java
import java.util.Arrays;

public class EnhancedForLoopExample {
    public static void main(String[] args) {
        // 定义一个整数数组
        int[] numbers = {1, 2, 3, 4, 5};
        // 使用增强 for 循环遍历数组
        for (int number : numbers) {
            System.out.println(number);}}}
```

### 4.equals方法

```java
public class StringEqualsExample {
    public static void main(String[] args) {
        String str1 = "Hello";
        String str2 = "Hello";
        String str3 = "World";
        // 使用 equals() 方法比较字符串
        boolean isEqual1 = str1.equals(str2);
        boolean isEqual2 = str1.equals(str3);
        System.out.println("str1 和 str2 是否相同: " + isEqual1);
        System.out.println("str1 和 str3 是否相同: " + isEqual2); }}
```

tips：equalsIgnoreCase()方法与之类似 但是比较时会忽略大小写

### 5.round（四舍五入）方法

```java
public class MathRoundExample {
    public static void main(String[] args) {
        // 对 float 类型进行四舍五入
        float floatNumber = 3.7f;
        int roundedFloat = Math.round(floatNumber);
        System.out.println("对 " + floatNumber + " 四舍五入结果: " + roundedFloat);
        // 对 double 类型进行四舍五入
        double doubleNumber = 2.3;
        long roundedDouble = Math.round(doubleNumber);
        System.out.println("对 " + doubleNumber + " 四舍五入结果: " + roundedDouble);}}
```

### 6.sort（用于数组排序）方法 #易忘

```java
import java.util.Arrays;

public class ArraySortExample {
    public static void main(String[] args) {
        // 定义一个整数数组
        int[] numbers = {5, 2, 8, 1, 9};

        // 使用 Arrays.sort 方法对数组进行排序
        Arrays.sort(numbers);

        // 输出排序后的数组
        for (int num : numbers) {
            System.out.print(num + " "); }}}
```

### 7.string类常见方法总和

#### 7.1 获取字符串长度 length

```java
String str = "Hello World";
int length = str.length();
System.out.println("字符串的长度是: " + length); 
```

#### 7.2 拼接运算符 +

```java
int num = 10;
String str3 = "数字是 " + num;
System.out.println(str3); 
```

#### 7.3 比较字符串 equals( ) equalsIgnoreCase( ) compareTo( ) #易忘

```java
String str4 = "Java";
String str5 = "java";
boolean isEqual = str4.equals(str5);
System.out.println("两个字符串内容相等吗？ " + isEqual); 
```

equalsIgnoreCase()方法判断时忽略大小写(返回值为布尔类型 和equals一样)

compareTo()方法判断时返回值为正数或者负数

#### 7.4判断字符(如endswith)

```java
String str18 = "example.txt";
boolean endsWithTxt = str18.endsWith(".txt");
System.out.println("字符串是否以 '.txt' 结尾？ " + endsWithTxt);
```

### 8.函数重载

含义：方法名相同 但是方法的参数列表必须不同（参数的个数 类型 或者顺序） 不能根据参数的返回值类型区分重载方法

```java
public class OverloadingExample {
    // 第一个重载方法，接受两个整数参数
    public int add(int a, int b) {
        return a + b;
    }

    // 第二个重载方法，接受三个整数参数
    public int add(int a, int b, int c) {
        return a + b + c;
    }

    // 第三个重载方法，接受两个双精度浮点数参数
    public double add(double a, double b) {
        return a + b;
    }

    public static void main(String[] args) {
        OverloadingExample example = new OverloadingExample();//为example申请新的空间
        int result1 = example.add(2, 3);
        int result2 = example.add(2, 3, 4);
        double result3 = example.add(2.5, 3.5);
        System.out.println("两个整数相加结果: " + result1);
        System.out.println("三个整数相加结果: " + result2);
        System.out.println("两个双精度浮点数相加结果: " + result3);
    }
}
```

类似的 构造函数也可以重载（分别接受不同的参数 根据实例需求以不同的方式初始化对象）

```java
public class ConstructorOverloading {
    private int num;
    private String str;

    // 第一个构造函数，接受一个整数参数
    public ConstructorOverloading(int num) {
        this.num = num;
    }

    // 第二个构造函数，接受一个字符串参数
    public ConstructorOverloading(String str) {
        this.str = str;
    }

    // 第三个构造函数，接受一个整数和一个字符串参数
    public ConstructorOverloading(int num, String str) {
        this.num = num;
        this.str = str;
    }

    public void display() {
        System.out.println("数字: " + num + ", 字符串: " + str);
    }

    public static void main(String[] args) {
        ConstructorOverloading obj1 = new ConstructorOverloading(10);
        ConstructorOverloading obj2 = new ConstructorOverloading("Hello");
        ConstructorOverloading obj3 = new ConstructorOverloading(20, "World");
        obj1.display();
        obj2.display();
        obj3.display();
    }
}
```

### 9.this用法

#### 1.引用当前对象的成员变量

```java
public class ThisWithVariables {
    private int num;

    public ThisWithVariables(int num) {
        // 这里的this.num指的是成员变量num
        // num指的是构造函数的参数num
        this.num = num;
    }

    public void display() {
        System.out.println("成员变量 num 的值为: " + this.num);
    }

    public static void main(String[] args) {
        ThisWithVariables obj = new ThisWithVariables(10);
        obj.display();
    }
}
```

#### 2.调用当前对象的其他方法

```java
public class ThisWithMethods {
    public void method1() {
        System.out.println("这是 method1");
    }

    public void method2() {
        // 使用this调用method1
        this.method1();
        System.out.println("这是 method2");
    }

    public static void main(String[] args) {
        ThisWithMethods obj = new ThisWithMethods();
        obj.method2();
    }
}
```

#### 3.返回当前对象

```java
public class Shape {
    private String color;
    private int lineWidth;

    public Shape setColor(String color) {
        this.color = color;
        return this;
    }

    public Shape setLineWidth(int lineWidth) {
        this.lineWidth = lineWidth;
        return this;
    }

    public void draw() {
        System.out.println("绘制形状，颜色: " + color + ", 线条宽度: " + lineWidth);
    }

    public static void main(String[] args) {
        Shape shape = new Shape();
        shape.setColor("红色").setLineWidth(3).draw();
    }
}
```

#### 4.在构造函数中调用其他构造函数 #易忘

```java
public class ThisInConstructor {
    private int num;
    private String str;

    // 第一个构造函数
    public ThisInConstructor() {
        // 调用接受两个参数的构造函数
        this(0, "default");
        System.out.println("无参数构造函数");
    }

    // 第二个构造函数
    public ThisInConstructor(int num) {
        // 调用接受两个参数的构造函数
        this(num, "default");
        System.out.println("接受一个整数参数的构造函数");
    }

    // 第三个构造函数
    public ThisInConstructor(int num, String str) {
        this.num = num;
        this.str = str;
        System.out.println("接受两个参数的构造函数");
    }

    public void display() {
        System.out.println("数字: " + num + ", 字符串: " + str);
    }

    public static void main(String[] args) {
        ThisInConstructor obj1 = new ThisInConstructor();
        ThisInConstructor obj2 = new ThisInConstructor(10);
        obj1.display();
        obj2.display();
    }
}
```

### 10.运算符

#### 1.基本赋值运算符

```txt
int a = 10;
```

#### 2.扩展赋值运算符

```txt
a + = b；//运算的结果等价为a=a+b     扩展的赋值运算隐含了强制的类型转换  转换为a的类型
```

tips：所有的数据类型在运算时会自动转换为int形式 扩展运算符可以保留原有的数据类型

#### 3.三元运算符

```java
int max = a>b?a:b;
String result = score >=60 ?"通过"："挂科"
```

### 11.静态方法 static #易忘

#### 1.static修饰的对象

##### 1.静态变量（类变量）

有static修饰 属于类 在计算机中只有一份 且被类的全部对象共享

##### 2.实例变量（对象的变量）

无static修饰 属于每个对象 只能被对应的对象享有

```java
public class Student{
    
    //静态变量
    static String name;  
    
    //实例变量（对象的变量）
    int age;
}
```

#### 2.static修饰的方法

##### 1.静态方法

有static修饰的成员方法 属于类

```java
public static void print(){
    System.out.println("hello world");
    System.out.println("hello world");
}

//调用方法：
//类名.print()  或者  对象名.print()
```

##### 2.实例方法

无static修饰的成员方法 属于对象

```java
public void print(){
    System.out.println("hello world");
    System.out.println("hello world");
}

//调用方法：
//只能用  对象名.print()
```

#### 3.tips：

静态方法中可以直接访问静态成员 不可以直接访问实例成员

实例方法中既可以直接访问静态成员 也可以直接访问实例成员

实例方法中可以出现this关键字 静态方法中不可以出现this关键字

### 12.继承 extends

含义：java中提供了一个关键字extends 用这个关键字 可以让一个类和另一个类建立起父子关系

```java
public class B extends A{
    //A类称为父类（基类或者超类）
    //B类称为子类（派生类）
}
```

1.子类可以继承父类的非私有成员（成员变量 成员方法）

2.子类可以间接访问父类的私有成员 （调用非私有成员方法）

### 13.权限修饰符

| 修饰符号      | 访问权限                   |
| --------- | ---------------------- |
| private   | 只能在当前类中访问              |
| 缺省        | 当前类中 同一个包下的其他类中        |
| protected | 当前类中 同一个包下的其他类中 子孙类中访问 |
| public    | 任何地方都可以访问              |

### 14.继承后的就近原则 #易忘

```java
package com.itheima.extendsdemo;
public class extendsdemo {
    public static void main(String[] args) {
        zi zi = new zi();
        zi.show();
    }
}
class fu{
    String name = "fu";
}
class zi extends fu{
    String name = "zi";
    public void show(){
        String name = "show";
        System.out.println(name);        //运行结果显示 show
        System.out.println(this.name);   //运行结果显示  zi
        System.out.println(super.name);  //运行结果显示  fu
    }
}
```

### 15.方法重写

```java
package com.itheima.extends3override;
public class Test {
    public static void main(String[] args) {
        Cat cat = new Cat();
        cat.cry();
    }
}
class Animal{
    public void cry() {
        System.out.println("动物会叫~");
    }
}
class Cat extends Animal{
    @Override//方法重写的效验注解  方法重写的规范：声明不变 重新实现
    public void cry() {
        System.out.println("喵喵喵~");//执行的是这个
    }
}
```

1.子类重写父类的方法时 访问权限必须大于或者等于父类该方法的权限

2.重写的方法返回值类型 必须与被重写方法的返回值类型是一样的 或者范围更小

3.私有方法 静态方法不能被重写 否则会报错

### 16.构造器

#### 1.基本

```java
package com.itheima.extends4constructor;

public class Test {
    public static void main(String[] args) {
        Zi zi = new Zi();//构造子类对象时  先运行父类的构造器 再运行子类的构造器
    }
}
class Fu {
    public Fu(){
        System.out.println("父类的构造器运行了");  //先运行
    }
}
class Zi extends Fu {
    public Zi(){
        System.out.println("子类的构造器运行了");  //后运行
    }
}
```

#### 2.父类没有无参构造器

```java
package com.itheima.extends4constructor;

public class Test {
    public static void main(String[] args) {
        //Zi zi = new Zi();
        Zi zi1 = new Zi();
    }
}

class Fu {//父类没有无参构造器
    public Fu(int a){
        System.out.println("父类的构造器运行了");
    }
}

class Zi extends Fu {

    public Zi(){
        super(666);//必须先调用父类的构造器 因为没有无参 手动先调用有参
        System.out.println("子类的构造器运行了");
    } 
}
```

#### 3.兄弟构造器

```java
package com.itheima.extends4constructor;

public class Test2 {
    public static void main(String[] args) {
        Student s1 = new Student("张三","男",18);
        System.out.println(s1);
        Student s2 = new Student("李四","女",20,"Just");
        System.out.println(s2);
    }
}

class Student {
    private String name;
    private String sex;
    private int age;
    private String schoolName;

    public Student() {}
    public Student(String name, String sex, int age){
        this(name,sex,age,"unkonwn");//s1此处缺少参数 调用兄弟构造器
    }
    public Student(String name, String sex, int age, String schoolName) {
        this.name = name;
        this.sex = sex;
        this.age = age;
        this.schoolName = schoolName;
    }

   @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", sex='" + sex + '\'' +
                ", age=" + age +
                ", schoolName='" + schoolName + '\'' +
                '}';
    }
}
```

### 17.多态  #易忘

指的是在继承/实现情况下的一种现象 表现为对象多态、行为多态

```java
package com.itheima.polymorphsm1;

public class Test {
    public static void main(String[] args) {
        //多态：对象多态和行为多态  
        //编译看右边  运行看左边  
        //成员变量：编译看左边 运行也看左边
        Animal a1 = new Wolf();
        Animal b2 = new Tortoise();
        //run（）必须重写
        a1.run();
        b2.run();
        System.out.println(a1.name);//运行结果为动物
        System.out.println(b2.name);//运行结果为动物
    }
}



package com.itheima.polymorphsm1;

public class Animal {
    String name = "动物";
    public void run(){
        System.out.println("动物会跑~");
    }
}



package com.itheima.polymorphsm1;

public class Wolf extends Animal {
    String name = "狼";
    @Override
    public void run(){
        System.out.println("狼跑的贼快");
    }
}



package com.itheima.polymorphsm1;

public class Tortoise extends Animal{
    String name = "乌龟";
    @Override
    public void run() {
        System.out.println("乌龟跑的贼慢");
    }
}
```

多态的好处

```java
package com.itheima.polymorphsm2;

public class Test {
    public static void main(String[] args) {
        //可以解耦合 便于扩展和维护
        Animal a1 = new Tortoise();
        Animal b2 = new Wolf();
        start(a1);
        start(b2);
    }
    public static void start(Animal a){//可以接受一切的子类对象
        System.out.println("——————————————开始————————————————");
        a.run();
    }
}
```

缺陷：

不能调用子类独有的方法（必须是重写的方法）

此时可以调用强制类型转换

```java
package com.itheima.polymorphsm3;

public class Test {
    public static void main(String[] args) {
        Animal a1 = new Tortoise();
        start(a1);
        Tortoise t1 = (Tortoise) a1;// 子类 变量名 = （子类） 父类变量
        t1.shrinkHead();
    }
    public static void start(Animal a){
        System.out.println("——————————————开始————————————————");
        a.run();
    }
}
```

强制类型转换前可以先进行判断

```java
if(a1 instanceof Wolf){
    Wolf t  = (Wolf) a;
}else if(a1 instanceof Tortoise){
    Tortoise t = (Tortoise)a;
}
```

### 18.final关键字

修饰类：该类被成为最终类

修饰方法：该方法被称为最终方法 特点是不能被重写了

修饰变量：该变量有且仅能被赋值一次

```java
//可以定义常量 不可以被修改
public static final double PI = 3.1415;
```

### 19.单例设计模式

#### 1.饿汉式单例

```java
//单例设计模式
public class A{
    //1.定义一个类变量记住类的一个对象    
    private static A a = new A();
    //2.私有构造器
    private A(){}
    //3.定义一个类方法返回对象
    public static A getobject(){
        return a;
    }
}
```

#### 2.懒汉式单例
只有在使用到对象时候才建立

### 20.枚举类  #易忘

```java
package com.itheima.enumdemo;

public enum Direction {
    up,down,left,right;
}

public class Test {
    public static void main(String[] args) {
        move(Direction.up);
    }
        public static void move(Direction direction){
        switch (direction){
                //可以省略Direction前缀
            case  up:
                System.out.println("向上移动");
                break;

            case down:
                System.out.println("向下移动");
                break;

            case left:
                System.out.println("向左移动");
                break;

            case right:
                System.out.println("向右移动");
                break;

            default:
                System.out.println("输入有误");
        }
    }
}
```

### 21.抽象  #易忘

#### 1.抽象类

```java
public abstract class A {
    
}
```

#### 2.抽象方法

```java
 public abstract void show();   //没有方法体  只有方法声明
```

#### tips：

抽象类中不一定要有抽象方法 有抽象方法的类必须是抽象类

类有的成员：成员变量 方法 构造器 抽象类都可以有

抽象类最主要的特点是：抽象类不可以创建对象 仅作为一种特殊的父类 让子类继承并实现

一个类继承抽象类 必须重写完全部的抽象方法 否则这个类也必须定义成抽象类

### 22.模版方法设计模式

提供了一个方法作为完成某类功能的模版 模版方法封装了每个实现步骤 但允许子类提供特定步骤的实现

### 23.接口interfa  #易忘

#### 1.基础知识

jdk8之前 接口只能定义常量和抽象方法 且前缀可以省略

接口不能创建对象

```java
public interface A{
    String SCHOOL_NAME = "黑马程序员";//定义常量  前面的public static final可以省略
    void run();//定义抽象方法  前面的public abstract 可以省略
}
```

接口是用来被实现的（implements） 实现接口的类成为实现类 一个类可以同时实现多个接口

```java
class c implements B,A{
   //实现类实现类多个接口  必须重写完全部接口的全部抽象方法  否则这个类必须定义成抽象类
    @Override
    public void run() {
        
    }
    @Override
    public void play() {
    }
}


//接口 使用interface关键字
public interface A {
    void run();
}

public interface B {
    void play();
}
```

#### 2.jkd8开始新增了三种形式的方法

```java
public interface A{
    //1.默认方法(实例方法)  使用default修饰 默认会被加上public修饰
    //只能用接口的实现类对象调用
    default void test1(){
        
    }
    
    //2.私有方法 必须要用private修饰（jdk9才开始支持）
    private void test2(){
        
    }
    
    //3.类方法（静态方法） 使用static修饰 默认会被加上public修饰
    //只能用接口名来调用
    static void test3(){
        
    }        
}
```

```java
package com.itheima.interface3;

public class Test {
    public static void main(String[] args) {
        A b = new B();
        b.run();//实例接口的实现类对象调用
        A.start();//可以用接口名调用
    }
}

class B implements A{}

public interface A {
    default void run(){
        System.out.println("run方法实施了");
        play();//不能直接调用  可以间接调用
    }

    private void play() {
        System.out.println("play方法实施了");
    }

    static void start() {
        System.out.println("start方法实施了");
    }
}
```

#### 3.注意事项

1.接口与接口可以多继承 一个接口可以继承多个接口

```java
interface A{
    void show1();
}

interface B{
    void show2();
}

interface C extends A,B{
    void show3();
}

class D extends C{
    @Override
    public void show1(){
        
    };
    @Override
    public void show2(){
        
    };
    @Override
    public void show3(){
        
    };
}
```

2.一个接口可以继承多个接口 如果多个接口中存在方法签名冲突 则此时不支持多继承 也不支持多实现

3.一个类继承了父类 又同时实现了接口 如果父类中和接口中有同名的默认方法 实现类会优先用父类的

```java
interface A{
    default void show(){
    }
}

class B{
    public void show(){
        
    }
}

class C extends A implements B{
    
}
//此时c调用的是B类中的show方法
```

4.一个类实现了多接口 如果多个接口中存在同名的默认方法 可以不冲突 这个类重写该方法即可

```java
interface A{
    default void show(){}
}

interface B{
     default void show(){}
}

class C implements A,B{
    @Override
    public void show(){//实现该方法的重写
        //也可以指定实现接口的功能
        A.super.show(); 
        B.super.show();
    }
}
```

### 25.抽象类和接口的区别对比  #？？？

相同点

```txt
都是抽象形式 都可以有抽象方法  都不能创建对象
都是派生子类的形式 抽象类是被子类继承使用的 接口是被实现类实现
一个类继承抽象类 或者实现接口 都必须重写完他们的抽象方法 否则自己要成为抽象类或者报错
都能支持的多态 都能够实现解耦合
```

不同点

```txt
抽象中可以定义类的全部普通成员 接口只能定义常量抽象方法（jdk8新增三种方式）
抽象类只能被单类继承 接口可以被多类多实现
一个类继承抽象类就不能再继承其他类 一个类实现了接口还可以继承其他类或者实现其他接口
抽象类体现模版思想 更利于做父类 实现代码的复用性
接口更适合做功能的解耦合 解耦合性更强更灵活
```

### 26.代码块  #易忘

#### 1.静态代码块

类加载时自动执行 类加载一次 所以静态代码块也只执行一次

作用：完成类的初始化

比如

```java
package com.ithema.code;

import java.util.Arrays;

public class CodeDemo1 {
    public static int [] num = new int[3];
    //静态代码块：有static修饰 属于类 与类一起优先加载 自动执行一次
    static{
        System.out.println("代码块执行了");
        num[0]=1;
        num[1]=2;
        num[2]=3;
    }

    public static void main(String[] args) {
        System.out.println("main函数执行了");
        System.out.println(Arrays.toString(num));//打印数组内容
    }
}
```

#### 2.实例代码块

每次创建对象时 执行实例代码块 并在构造器前执行

```java
package com.ithema.code;

import java.util.Arrays;

public class CodeDemo2 {
    private String name;
    private String []direction = new String[4];
    //实例代码块 创建对象时候会优先执行一次
    {
        System.out.println("实例代码块执行了");
        direction[0]="东";
        direction[1]="西";
        direction[2]="南";
        direction[3]="北";
    }

    public CodeDemo2(){
        System.out.println("构造器执行了");
    }

    public static void main(String[] args) {
        System.out.println("main方法执行了");
        CodeDemo2 cd2= new CodeDemo2();//先调用实例代码块 再调用构造器
        System.out.println(Arrays.toString(cd2.direction));//执行结果为  [东, 西, 南, 北]
    }
}
```

### 27.内部类  #易忘

#### 1.成员内部类

属于外部类的对象持有

定义对象的方式： 外部类.内部类 对象名 = new 外部类（）.new 内部类（）

```java
package com.itheima.innerclass;

public class InnerClassDemo1 {
    public static void main(String[] args) {
        Outer.Inner oi = new Outer().new Inner();
        oi.show();//调用内部类的方法
    }
}

public class Outer {

    public class Inner {
        public void show() {
            System.out.println("内部类的show方法实现了");
        }
    }
}
```

1.成员内部类中可以直接访问外部类的静态成员 也可以直接访问外部类的实例成员

2.成员内部类的实例方法中 可以直接拿到当前寄生的外部类对象 外部类名.this.对象

```java
package com.itheima.innerclass;

public class Peoeple {
    private int heatbeat = 100;
    class  Heat {
        private int heatbeat = 140;
        public void show() {
            int heatbeat = 80;
            System.out.println(heatbeat);//80
            System.out.println(this.heatbeat);//140
            System.out.println(Peoeple.this.heatbeat);//100
        }
    }
}
```

#### 2.静态内部类

定义对象的方式： 外部类.内部类 对象名 = new 外部类. 内部类（）

属于外部类本身持有

静态内部类可以访问外部类的静态成员 但是不可以访问实例成员

#### 3.局部内部类（了解）

定义在方法 代码块 构造器等执行体中

#### 4.匿名内部类  #？？？

```java
package com.itheima.innerclass2;

public abstract class Animal {
    public abstract void cry();
}

public class Test {
    public static void main(String[] args) {
        
        Animal cat = new Animal() {
            
            @Override
            public void cry() {
                System.out.println("喵~");
            }
        };
        cat.cry();
    }
}
```

接口类型  #？？？

```java
package com.itheima.innerclass2;

public class Test2 {

    public static void main(String[] args) {
        SportsMode stu1 = new SportsMode() {
            @Override
            public void swimming() {
                System.out.println("学生游泳");
            }

            @Override
            public void run() {
                System.out.println("学生跑步");
            }

            @Override
            public void walk() {
                System.out.println("学生散步");
            }
        };
           start(stu1);
    }
    public static void start(SportsMode sm){
        sm.run();
        sm.swimming();
        sm.walk();
    }
}

interface SportsMode{
    void swimming();
    void run();
    void walk();
}
```

### 28.函数式编程  #易忘

Lambda函数式接口的匿名内部类

```java
package lambda;

import org.w3c.dom.ls.LSOutput;

public class LambdaDemo1 {
    public static void main(String[] args) {
        swim a1 = ()->{
            System.out.println("游泳啦");
        };
        a1.swimming();
        //lambda只能优化函数式接口
        // 为什么：函数式接口只有一个抽象方法
    }
    }
@FunctionalInterface
interface swim {
    void swimming();
}
```

简化

```java
//简化前
Arrays.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student o1, Student o2) {
                return o1.getAge() - o2.getAge();
            }
        });
```

```java
//简化后 
Arrays.sort(students, (o1, o2)-> o1.getAge() - o2.getAge());


//1.参数类型可以省略不写
//2.如果只有一个参数 参数类型省略的同时括号“（）”也可以省略  但是多个参数不可以省略
//3.如果Lambda表达式中只有一行代码  大括号可以不写  同时要省略分号“；”  如果这行代码是return语句  也必须去掉return

```

#### 1.静态方法引用

如果某个Lambda表达式只是调用一个静态方法 并且->前后参数的类型一致 就可以使用静态方法引用

形式： 类名：：静态方法

```java
package com.itheima.method1reference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class Student {
    private String nama;
    private int age;
    private double height;
    private char sex;
    public static int compareStudent(Student s1, Student s2) {
        return s1.getAge() - s2.getAge();
    }
}

import java.util.Arrays;
public class Demo1 {
    public static void main(String[] args) {

        Student[] students = new Student[6];
        students[0] = new Student("Rain1",22,186.5,'男');
        students[1] = new Student("Rain2",21,187.5,'男');
        students[2] = new Student("Rain3",20,188.5,'男');
        students[3] = new Student("Rain4",19,189.5,'男');
        students[4] = new Student("Rain5",18,190.5,'男');
        students[5] = new Student("Rain6",23,191.5,'男');

        Arrays.sort(students, Student::compareStudent);

        for(Student i:students) System.out.println(i);
    }
}
```

#### 2.实例方法

和上述类似 将类名换成对象名

#### 3.特定类型的方法

和上述类似 将类名换成特定类型方法

```java
package com.itheima.method1reference;

import java.util.Arrays;

public class Demo2 {
    public static void main(String[] args) {
        String []names = {"Lisa","Mike","Tom","孙权","Angel","Merry","askll","bobby","silly","曹操","李信"};
        
        Arrays.sort(names,String::compareToIgnoreCase);//该方法是string中忽视大小写的比较的方法
        
        System.out.println(Arrays.toString(names));
    }
}
```

#### 4.构造器

类名：：new

### 29.API  #UntilThis

#### 1.String

```java
package com.itheima.stringdemo;

public class StringDemo1 {
    public static void main(String[] args) {
        String  s1 = "hello";
        String  s2 = "hello";
        System.out.println(s1 == s2);//true
        String  s3 = new String("hello");//储存的是地址
        String  s4 = new String("hello");//储存的是地址
        System.out.println(s3 == s4);//false
        System.out.println(s1 == s3);//false
    }
}
```

常用的方法

```java
package com.itheima.stringdemo;

public class demo {
    public static void main(String[] args) {
        String s1 = "helloworld";
        String s2 = "HELLOWORLD";
        System.out.println(s1==s2);//false                                   ==默认比较的是两个字符串的地址  内容一样 地址不一定一样
        System.out.println(s1.equals(s2));// false                           判断两个字符串是否相等  区分大小写
        System.out.println(s1.equalsIgnoreCase(s2));// true                  判断两个字符串是否相等 不区分大小写
        System.out.println(s1.length()+" "+s2.length());//10 10              返回字符串的长度
        System.out.println(s1.charAt(0));// h                                返回某一位置的字符（位置从0开始）
        System.out.println(s1.substring(2));// lloworld                      返回从第n位置后面的字符
        System.out.println(s2.substring(2,5));// LLOW                        返回从第a位置到第b位置的字符
        String s3 = s1.replace("h","H");//调用方法创建新的对象                 替换字符								 
        System.out.println(s3);// Helloworld                    
        System.out.println(s1);// helloworld                                 原对象不造成影响
        System.out.println(s1.contains("world"));// true                     判断字符串是否包含某一字符串
        System.out.println(s1.startsWith("h"));// true                       判断是否以某一字符开始
        System.out.println(s1.endsWith("d"));// true                         判断是否以某一字符结束
    }
}
```

#### 2.ArrayList

```java
package com.itheima.ArrayList;

import java.util.ArrayList;

public class ArrayListDemo1 {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("hello");//0
        list.add("world");//1
        list.add("java");//2
        list.add("c++");//3
        list.add("python");//4

        list.get(0);//hello     获取集合中索引为0的元素
        list.set(0,"java");//将索引为0的元素替换为java  返回被替换的元素
        list.add(1,"hello");//添加元素  后面的元素向后移动一位
        list.remove(1);//根据索引删除world  返回被删除的元素
        list.remove("java"); //根据元素删除java  返回删除是否成功
        list.size();//获取集合的长度
        list.contains("java");//判断集合中是否包含java
    }
}
```

### 30.GUI编程（了解即可）

事件的几种写法

1.直接提供实现类 用于创建时间监听对象

```java
package com.itheima.GUI2;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;

public class Test {

    public static void main(String[] args)
    {   JFrame jf = new JFrame("登录窗口");
        JPanel jp = new JPanel();

        jf.add(jp);

        jf.setSize(400,300);
        jf.setLocationRelativeTo(null);
        jf.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JButton jb = new JButton("登录");
        jb.setBounds(100,100,100,50);
        jp.add(jb);

        jb.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                JOptionPane.showMessageDialog(jf,"登录成功");
            }
        });

        //需求：监听用户键盘上下左右四个按键的事件
        jf.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                System.out.println("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                if(e.getKeyCode()==KeyEvent.VK_UP)
                    System.out.println("用户按下了上");
                else if(e.getKeyCode()==KeyEvent.VK_DOWN)
                    System.out.println("用户按下了下");
                else if(e.getKeyCode()==KeyEvent.VK_LEFT)
                    System.out.println("用户按下了左");
                else if(e.getKeyCode()==KeyEvent.VK_RIGHT)
                    System.out.println("用户按下了右");
            }
        });
        
        jf.setVisible(true);
        //让窗口置顶
        jf.requestFocus();
    }
}
```

2.直接使用匿名内部类的对象 代表时间监听对象

```java
package com.itheima.GUI2;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Test2 {
    public static void main(String[] args) {
        JFrame jf = new JFrame("登录窗口");

        JPanel jp = new JPanel();
        jf.add(jp);

        jf.setSize(400,300);
        jf.setLocationRelativeTo(null);
        jf.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JButton jb = new JButton("登录");
        jb.setBounds(100,100,100,50);
        jp.add(jb);

        jb.addActionListener(new MyActionListener(jf));

        jf.setVisible(true);
    }
}

class MyActionListener implements ActionListener {
    private JFrame jf;
    public MyActionListener(JFrame jf) {
       this.jf = jf;
    }
    @Override
    public void actionPerformed(ActionEvent e) {
        JOptionPane.showMessageDialog(jf,"登录成功");
    }
}
```

3.自定义窗口 让窗口对象实现事件接口

```java
package com.itheima.GUI2;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Test3 {
    public static void main(String[] args) {
        Test3LoginFrame jf = new Test3LoginFrame();
        jf.setVisible(true);
    }
}



public class Test3LoginFrame extends JFrame implements ActionListener {
    public Test3LoginFrame() {
        this.setTitle("登录界面");
        this.setSize(400, 300);
        this.setLocationRelativeTo(null);
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        init();

    }

    private void init() {
        JButton jb = new JButton("登录");
        jb.addActionListener(this);
        JPanel jp = new JPanel();
        this.add(jp);
        jp.add(jb);

    }

    @Override
    public void actionPerformed(ActionEvent e) {
        JOptionPane.showMessageDialog(this,"登录成功");
    }
}
```

# 三.进阶语法

## 1.java异常体系

### 作用

- 异常是定位程序bug的关键信息
- 可以作为方法内部的一种特殊返回值 以便通知上层调用者 方法的执行问题

```java
package com.ithiema.demo1exception;

public class ExceptionDemo2 {
    public static void main(String[] args) {
        div(10,0);
    }
    
    public static int div(int a,int b){
        if(b==0){
            System.out.println("分母不能为0");
            throw new RuntimeException("分母不能为0");
        }
        return a/b;
    }
}
```

### 1.Error

代表系统级别的错误（属于严重问题）

### 2.Exception

代表的是程序可能出现的问题

- 运行时异常：RuntimeException及其子类 编译阶段不会出现错误提醒 运行时出现的异常（如数组索引越界异常）

```java
package com.ithiema.demo1exception;

public class ExceptionDemo1 {
    public static void main(String[] args) {
        show();
    }
    
    public static void show() {
        int[] arr = {10,20,30};
        System.out.println(arr[3]);
    }
}
```

- 编译时异常：编译阶段就会出现错误提醒的（如日期解析异常）

```java
package com.ithiema.demo1exception;

import java.text.SimpleDateFormat;
import java.util.Date;

public class ExceptionDemo2 {
    public static void main(String[] args) {
        try {
            show();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    public static void show() throws Exception {
        String str = "2020-5-20 13:14:00";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = sdf.parse(str);//没有抛出异常的话此处编译时会报错
        System.out.println(date);
    }
}
```

## 2.泛型

### 1.认识泛型

```java
package com.itheima.demo2genericity;

import java.util.ArrayList;

public class GenericityDemo1 {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();//  <  >内的为泛型    表示集合list只能接受String类型的元素
        list.add("JAVA");
        list.add("C++");
        list.add("a");
        list.add("s");
        list.add("w");
        for (String i: list) {
            System.out.println(i);
        }
    }
}
```

### 2.泛型类

```java
package com.itheima.demo2genericity;

public class GenericityDemo2 {
    public static void main(String[] args) {
        MyArrayList<String> slist = new MyArrayList<>();

        slist.add("Java");
        slist.add("C++");
    }
}

import java.util.ArrayList;

public class MyArrayList <T>{//外包装的泛型
    private ArrayList<T> list = new ArrayList<>();
    public void add(T t) {
        list.add(t);
    }

    public T get(int index) {
        return list.get(index);
    }

    public int size() {
        return list.size();
    }
}
```

### 3.泛型接口

```java
package com.itheima.demo3genericity;

public interface Date<T> {
    void add(T t);
    void delete(T t);
    T get(int index);
}
```

### 4.泛型方法

```java
package com.itheima.demo3genericity;

public class GenericityDemo3 {
    public static void main(String[] args) {

        String []strings = {"JAVA","C++","C","Python"};
        Integer []ints = {1,2,3,4,5,6,7,8,9,10};
        Double []doubles = {1.1,2.2,3.3,4.4,5.5};
        showArray(strings);
        showArray(ints);
        showArray(doubles);

    }
    
    public static <T> void showArray(T[] arr)
    {
        for (T t : arr) {
            System.out.print(t+"  ");
        }
        System.out.println( );
    }
}
```

### 5.通配符

```java
package com.itheima.demo3genericity;

import java.util.ArrayList;

public class GenericityDemo4 {
    public static void main(String[] args) {

        ArrayList<XIAOMI> xiaomi = new ArrayList<>();
        xiaomi.add(new XIAOMI());
        show(xiaomi);

        ArrayList<HUAWEI> huawei = new ArrayList<>();
        huawei.add(new HUAWEI());
        show(huawei);
    }

    public static void show(ArrayList<? extends Car> list){
        System.out.println("方法运行成功");
    }
}

class Car{
}
class XIAOMI extends Car{
}
class HUAWEI extends Car{
}
```

- 泛型上线： ？extends Car（？能接收的必须是Car或者其子类）
- 泛型下线： ？extends Car（？能接收的必须是Car或者其父类）

### 6.泛型支持的类型

- 泛型不支持基本数据类型 只能支持对象类型（引用数据类型）
- 基本数据类型可以换成包装类使用

#### 包装类

| 基本数据类型   | 对应的包装类（引用数据类型） | 占用内存    | 取值范围                                                                |
| -------- | -------------- | ------- | ------------------------------------------------------------------- |
| byte     | Byte           | 1字节     | - 128 ~ 127                                                         |
| short    | Short          | 2字节     | - 32768 ~ 32767                                                     |
| **int**  | **Integer**    | 4字节     | - 2147483648 ~ 2147483647                                           |
| long     | Long           | 8字节     | - -9223372036854775808 ~ 9223372036854775807L                       |
| **char** | **Character**  | ------- | ------------------------------------------------------------------- |
| float    | Float          | 4字节     | 单精度浮点数 大约可以表示6 - 7位有效数字                                             |
| double   | Double         | 8字节     | 双进度浮点数 大约可以表示15 - 16位有效数字                                           |
| boolean  | Boolean        | ------- | ------------------------------------------------------------------- |

##### 如何构建对象：

```java
Integer i = Integer.valueof(100);//基本模式  下述为简化
Integer i = 100;
```

- 自动装箱：基本数据类型可以自动转换为包装类型

```java
Integer it1 = 113;
Integer it2 = 113;
Integer it3 = 1113;
Integer it4 = 1113;
System.out.println( it1 == it2 );  //输出的结果为true   在范围-127 ~128 自动装箱（享元模式）
System.out.println( it3 == it4 );  //输出的结果为false  比较的引用地址  不同的对象 引用地址不同
```

- 自动拆箱：包装类型可以自动转换为基本数据类型

```java
int i1 = it1;  
System.out.println(i1)//输出的结果为113
```

##### 基本类型转换：

```java
int i1 = 1113;
String s1 = Integer.toString(i);//s1的值为 “1113”

Integer i2 = i1;
String s2 = i2.toString();//s2的值为 “1113”

String s3 = i1 +" ";//s2的值为 “1113”  自动拆箱  字符串拼接

String str = "98";
int i = Integer.value(str);//i的值为98
```

## 3.单列集合 Collection

### collections工具类

```java
public static <T> boolean addAll(Collecion<? super T>) c,T...elements//给集合批量添加元素
public static <T> void shuffle(List <?> list)//打乱List集合中的元素排序
public static <T> void sort(List <T> list)//对List集合中的元素进行升序排序
public static <T> void sort(List <T> list ,Comparator < ? super T> c )//对List集合中元素，按照比较器对象指定的规则进行排序
```

### 1.List

添加的元素是有序 、可重复 、有索引的

```java
void add(int index,E element)   //在次集合中的指定位置插入指定的元素
E remove (int index)//删除指定索引处的元素  返回被删除的元素
E set (int index,E element)//修改指定索引处的元素  返回被修改的元素
E get (int index)//返回指定索引处的元素
```

#### 1.1 ArrayList ！！！

有序 可重复 有索引的（基于数组存储数据 添加第一个元素时候 创建一个默认长度10的数组）

#### 1.2 LinkedList

```txt
     有序  可重复   有索引的（基于链表存储数据）
```

基本语法：

```java
package com.itheima.demo5list;

import java.util.LinkedList;

public class ListDemo {
    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        list.addLast("JAVA");
        list.addLast("C++");
        list.addLast("python");
        list.addLast("c语言");
        System.out.println(list);
        while(!list.isEmpty() ){
        System.out.println(list.removeFirst());
        System.out.println(list);
    }
}
}
```

应用场景

- 设计栈

```java
package com.itheima.demo5list;

import java.util.LinkedList;

public class ListDemo2 {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<>();
        list.addLast("第一颗子弹");
        list.addLast("第二颗子弹");
        list.addLast("第三颗子弹");
        list.addLast("第四颗子弹");
        System.out.println(list);

        while(!list.isEmpty())
            System.out.println(list.removeFirst());
    }
}

```

### 2.Set

添加的元素是无序 、不重复 、无索引的

#### 2.1 HashSet ！！！

无序 不重复 无索引（基于数组+链表（+红黑树）存储数据 添加第一个元素时候 创建一个默认长度16的数组 默认加载因子0.75 数组名table）

- 哈希值

- 就是一个int类型的随机值 java中每个对象都有一个哈希值
- java中所有对象 都可以调用object类提供的hashCode方法 返回该对象给自己的哈希值

```java
public int hashCode();  //返回对象的哈希码值
```

- 对象哈希值的特点

- 同一个对象多次调用hashCode（）方法返回的哈希值是相同的
- 不同的对象 他们的哈希值大概率不相等 但也有可能会相等（哈希碰撞）

```java
package com.itheima.demo1hashset;

import java.util.HashSet;
import java.util.Set;

public class SetDemo2 {
    public static void main(String[] args) {
        Student s1 = new Student("小王", 20, 100, "北京");
        Student s2 = new Student("小王", 20, 100, "北京");
        Student s3 = new Student("小黑", 18, 100, "江苏");
        Student s4 = new Student("小张", 18, 100, "北京");

        Set<Student> set = new HashSet<>();
        set.add(s1);
        set.add(s2);
        set.add(s3);
        set.add(s4);
        System.out.println(set);
        System.out.println(s1.hashCode());
        System.out.println(s2.hashCode());
        System.out.println(s3.hashCode());
        System.out.println(s4.hashCode());

    }
}

package com.itheima.demo1hashset;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data//重写了hashcode方法和equals方法用于去重   如果对象的内容一样 那么哈希值也一样
@AllArgsConstructor
@NoArgsConstructor

public class Student {
    private String name;
    private int age;
    private int score;
    private String address;
}
```

##### LinkedHashSet

```txt
      有序  不重复  无索引
```

#### 2.2 TreeSet

按照大小默认升序排序 不重复 无索引

```java
package com.itheima.demo1hashset;

import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class SetDemo1 {
    public static void main(String[] args) {
        Set<Double> set = new TreeSet<>();
        set.add(9.8);
        set.add(9.9);
        set.add(9.7);
        set.add(9.6);
        set.add(9.5);
        set.add(9.9);
        set.add(9.5);

        System.out.println(set);//[9.5, 9.6, 9.7, 9.8, 9.9]
    }
}
```

- 自定义对象的排序

```java
package com.itheima.demo1hashset;

import java.util.Set;
import java.util.TreeSet;

public class SetDemo3 {
    public static void main(String[] args) {
//方式1：集合自定义Comparator比较器对象 重写比较规则
        Set<Teacher> teachers = new TreeSet<>((o1, o2) -> Double.compare(o1.getScore(), o2.getScore()));//先调用集合自身的比较
        teachers.add(new Teacher("小w", 18, 90));
        teachers.add(new Teacher("小z", 19, 88));
        teachers.add(new Teacher("小g", 19, 90));
        teachers.add(new Teacher("小s", 11, 65));
        teachers.add(new Teacher("小f", 15, 100));

        System.out.println(teachers);
    }
}

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class Teacher implements Comparable<Teacher>{
    private String name;
    private int age;
    private double score;
    
    @Override
    public String toString() {
        return "Teacher{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", score=" + score +
                '}'+"\n";
    }
//方式2：类实现Comparable接口 重写比较规则
    @Override
    public int compareTo(Teacher o) {//TreeSet会自动调用
        if(this.age != o.age){
            return o.age-this.age;
        }
        else return 1;//如果两个对象的age是一样的 返回值为0  系统认为是重复对象  会自动消重
    }
}
```

### 3.Collection集合常用方法

```java
public boolean add(E e)//给定的对象添加到当前集合中
public void clear()//清空集合中所有元素
public boolean remove(E e)//给定对象在当前集合中删除
public boolean contains(object obj)//判断是否含有该对象
public boolean isEmpty()//判断当前集合是否为空
public int size()// 返回当前集合中元素
public Object[] toArray()//将集合中元素存储到数组中
```

### 4.Collection的遍历方式

#### 1.迭代器

```java
package com.itheima.demo4collection;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

public class CollectionTravalDemo1 {
    public static void main(String[] args) {

        Collection <String> list = new ArrayList<>();
        list.add("JAVA");
        list.add("C++");
        list.add("python");
        list.add("c语言");
        Iterator<String> it = list.iterator();
        while(it.hasNext()){
            System.out.println(it.next());
            System.out.println();
        }
    }
}
```

#### 2.增强for循环

```java
package com.itheima.demo4collection;

import java.util.ArrayList;
import java.util.Collection;

public class CollectionTravalDemo2 {
    public static void main(String[] args) {
        Collection<String> list = new ArrayList<>();
        list.add("JAVA");
        list.add("C++");
        list.add("python");
        list.add("c语言");

        for(String s : list) {
            System.out.println(s);
        }
    }
}
```

#### 3.Lambda表达式

```java
package com.itheima.demo4collection;

import java.util.ArrayList;
import java.util.Collection;
import java.util.function.Consumer;

public class CollectionTravalDemo2 {
    public static void main(String[] args) {
        Collection<String> list = new ArrayList<>();
        list.add("JAVA");
        list.add("C++");
        list.add("python");
        list.add("c语言");

        list.forEach(new Consumer<String>() {

            @Override
            public void accept(String s) {
                System.out.println(s);
            }
        });
        //简化
        list.forEach(s-> System.out.println(s));
        //简化
        list.forEach(System.out::println);
        
    }
}
```

### 5.Collection并发修改异常

#### 1.for循环

```java
package com.itheima.demo4collection;

import java.util.ArrayList;

public class CollectionTravalDemo3 {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("JAVA");
        list.add("C++");
        list.add("python");
        list.add("c语言");
        list.add("html语言");
        list.add("数据库");
        //方案一  向后退一位  防止跳过补一位的元素
        for(int i = 0; i < list.size(); i++){
            String s = list.get(i);
            if(s.contains("语言")){
                list.remove(s);
                i--;//由于删除一个元素 下一个元素会自动补上去  导致跳过一个元素
            }
        }
         //方案二  倒着遍历
         for(int i = list.size() - 1; i >= 0; i--){
            String s = list.get(i);
            if(s.contains("语言")){
                list.remove(s);
            }
        }
                
        System.out.println(list);
    }
}
```

#### 2.Lambda表达式

```java
package com.itheima.demo4collection;

import java.util.ArrayList;
import java.util.Iterator;

public class CollectionTravalDemo3 {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("JAVA");
        list.add("C++");
        list.add("python");
        list.add("c语言");
        list.add("html语言");
        list.add("数据库");

       
        Iterator<String> it = list.iterator();
        while(it.hasNext()){
            String s = it.next();
            if(s.contains("语言")){
               it.remove();//如果用list.remove(s)的话  底层代码会判断删除的数据与原来的不匹配抛出异常（即状态不同步）
            }
        }
        
        System.out.println(list);

    }
}
```

## 4..双列集合 Map

- Map集合也被叫做“键值对集合” 格式{ key 1 = value 1 ，key 2= value 2，key 3= value 3}
- Map集合的所有键是不允许重复的 但值可以重复 键和值是一 一对应的 每一个键只能找到自己对应的值

### 1.HashMap<K,V>

无序 不重复 无索引

```java
package com.itheima.demo2map;

import java.util.HashMap;
import java.util.Map;

public class MapDemo1 {
    public static void main(String[] args) {
        Map<String,Integer> map = new HashMap<>();
        map.put("张三", 18);
        map.put("小王", 19);
        map.put("小王", 20);//会覆盖掉前面一个
        map.put("小张", 20);
        map.put(null,null);//键值都可以为null
        System.out.println(map);
    }
}
```

#### LinkedHashMap<K,V>

有序 不重复 无索引

### 2.TreeMap<K,V>

按照大小默认升序排序 不重复 无索引

### 3.常用的方法

```java
public V put(K key ,V value)  //添加元素
public int size()//获取集合的大小
public void clear()//清空集合
public boolean isEmpty//判断集合是否为空 
public V get(Object key)//根据键获取对应值
public V remove(Object key)//根据键删除整个元素
public boolean containsKey(Object key)//判断是否包含某个键
public boolean containsValue(Object value)//判断是否包含某个值
public Set<K> keySet()//获取全部键的集合
public Collection<V> values()//获取Map集合的全部值
```

### 4.Map的遍历方式

#### 1.forEach方法（lambda表达式）

```java
 map.forEach((k,v)-> System.out.println(k+ "="+v));
```

#### 2.键找值

```java
package com.itheima.demo2map;

import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class MapTraverseDemo3 {
    public static void main(String[] args) {
        Map<String,Integer > map = new TreeMap<>() ;
        map.put("num1", 1);
        map.put("num2", 2);
        map.put("num4", 4);
        map.put("num3", 3);
        map.put("num5", 5);

        Set<String> set = map.keySet();
        for (String key : set) {
            Integer value = map.get(key);
            System.out.println(key + "=" + value);
        }

    }
}
```

#### 3.键值对

```java
package com.itheima.demo2map;

import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class MapTraverseDemo4 {
    public static void main(String[] args) {
        Map<String,Integer > map = new TreeMap<>() ;
        map.put("num1", 1);
        map.put("num2", 2);
        map.put("num4", 4);
        map.put("num3", 3);
        map.put("num5", 5);

        Set <Map.Entry<String, Integer> > entrySet = map.entrySet();
        for (Map.Entry<String, Integer> entry : entrySet) {
            String key = entry.getKey();
            Integer value = entry.getValue();
            System.out.println(key + "=" + value);
        }
    }
}
```

### 5.Stream流

- 1.获取Stream流 （代表一条流水线 并能与数据源建立连接）
- 2.调用流水线的各种方法（对数据进行处理、计算）
- 3.获取处理的结果（遍历、统计、收集到一个新的集合中返回）

#### 1.获取集合的stream流

```java
List<String> list = new ArrayList<>();
Stream<String> s1 = list.stream();

Map<String, String> map = new HashMap<>();
Stream<String> s2 = map.keySet().stream();
```

#### 2.获取数组的stream流

```java
 String []arr = {"张三", "李四", "王五"};
//第一种
Stream<String> s3 = Arrays.stream(arr);
//第二种
Stream<String> s4 = Stream.of(arr);
```

#### 3.Stream流常用的方法

```java
Stream<T> filter (Predicate<? super T> predicate)//用于对流中的数据进行过滤
Stream <T> sorted()//对元素进行升序排序
Stream <T> sorted(Comparator<? super T> comparator)//按照指定规则排序
Stream <T> limit(long maxSize)//获取前几个元素
Stream <T> skip(long n)//跳过前几个元素
Stream <T> distinct()//去除流中的重复元素
<R> Stream <R> map(Function<? super T,? extends R>mapper)//对元素进行加工 并返回对应的新流
static <T> Stream<T> concat(Stream a , Stream b)//合并a和b两个流为新流
```

#### 4.收集Stream流

```java
package com.itheima.demo3stream;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class StreamDemo3 {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("张雪峰");
        list.add("张伟");
        list.add("张伟");
        list.add("周杰伦");
        list.add("张益达");
        list.add("李知恩");
        
        List <String> list2 = list.stream().filter(s->s.startsWith("张")).collect(Collectors.toList());
        System.out.println(list2);

        Set<String> set = list.stream().filter(s -> s.startsWith("张")).collect(Collectors.toSet());
        System.out.println(set);
    }
}
```

### 6.方法中可变参

```java
package com.itheima.demo4test;

import java.util.Arrays;

public class ParamDemo1 {
    public static void main(String[] args) {
        num();
        num(1,2,6,5,4,1,23,2);
        num(new int[]{5,6,5,4,1,2});
    }
    
    public static void num(int...nums) {
        System.out.println(nums.length);
        System.out.println(Arrays.toString(nums));
        System.out.println("------------------");
    }
}
```

#### 1.可变参数的特点和好处

- 特点：可以不传数据给它 可以传一个或者同时传多个数据给它 也可以传一个数组给它
- 好处：常常用来灵活的接受数据

#### 2.可变参数的注意事项

- 可变参数在方法内部就是一个数组
- 一个形参列表中可变参数只能有一个
- 可变参数必须放在形参列表的最后面

## 5.File--IO流

### 1.File

- 是java.io.包下面的类 File类的对象用于代表操作当前操作系统的文件（可以是文件或者文件夹）
- File类只能对文件本身操作 不能读写文件里面存储的数据
- 常用的方法

```java
public boolean exists()   //判断当前文件对象 对应的文件路径是否存在 存在则返回true
public boolean isFile()  //判断当前文件对象指代的是否是文件 是文件返回true 反之
public boolean isDirectory() //判断当前文件对象指代的是否是文件夹 是文件夹返回true 反之
public String getName()  //获取文件的名称（包含后缀）
public long length()  //获取文件的大小 返回字节的个数
public long lastModified()  //获取文件的最后修改时间
public String getPath() //获取创建对象时 使用的路径（idea工程下直接寻找文件）
public String getAbsolutePath()//获取绝对路径（带盘符的）
    
public boolean createNewFile()//创建一个新的空的文件夹
public boolean mkdir() //只能创建一级文件夹
public boolean mkdirs() //可以创建多级文件夹
    
public boolean delete() //删除文件、空文件夹（不会进入回收站）
    
public String[] list()  //获取当前目录下所有的“一级文件名称”到一个字符串数组中去返回
public File[] listFiles() //获取当前目录下所有的“一级文件对象”到一个文件对象数组中去返回（重点）
```

### 2.递归

```java
package com.itheima.demo2recursion;

public class RecursionDemo1 {
    public static void main(String[] args) {
            print(5);
    }
    
    public static void print(int n) {
        if (n > 0) {
            System.out.println(n);
            print(n - 1);
        }
    }
}
```

#### 1.递归的形式

- 直接递归：方法自己调用自己
- 间接递归：方法调用其他方法 其他方法又回调方法自己

#### 2.注意的问题

- 递归如果没有控制好终止 会出现递归死循环 导致栈内存溢出错误

#### 3.解决实际问题

- 计算阶乘

```java
package com.itheima.demo2recursion;

public class RecursionDemo2 {
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }

    public static int factorial(int n) {
        if (n == 1) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    }
}
```

- 寻找计算机程序

```java
package com.itheima.demo2recursion;

import java.io.File;

public class FileResearch4 {
    public static void main(String[] args) {
        File f1 = new File("C:/");
        search(f1,"QQ.exe");
    }

    public static void search(File dir,String filename){
        if(dir.isFile()||!dir.exists())
            return;
        File[] files = dir.listFiles();

        if(files != null&&files.length != 0) {
            for(File f : files){
                if(f.isFile()){
                    if(f.getName().contains(filename)){
                        System.out.println("找到文件"+f.getAbsolutePath());
                    }
                }else{
                    search(f,filename);
                }
            }
    }
}}
```

### 3.递归算法的三要素

- 递归的公式：f(n)=f(n-1)*n
- 递归的终结点：f(1)
- 递归的方向必须走向终结点

### 4.IO流

#### 1.分类

- 按照 流方向：

- 输入流
- 输出流

- 按照 流内容：

- 字节流：适合操作所有类型的文件（比如音频、视频、图片、文本文件的复制，转移等）
- 字符流：适合纯文本文件（读写txt、java文件等）

#### 2.体系

- 字节输入流 InputStream（读字节数据） 实现类：FileInputStream
- 字节输出流 OutputStream（写字节数据） 实现类：FileOutputStream
- 字符输入流 Reader（读字符数据） 实现类：FileReader

```java
public FileReader(File file)//创建字符输入流管道与源文件接通
public FileReader(String pathname)//创建字符输入流管道与源文件接通
    
public int read()//每次读取一个字符返回，如果发现没有数据可读会返回-1
public read(char [] buffer)//每次用一个字符数组去读取数据，返回字符数组读取了多少个字符，如果发现没有数据可读会返回-1
```

- 字符输出流 Writer（写字符数据） 实现类：FileWriter

```java
public FileWriter(File file)//创建字节输出流管道与源文件对象接通
public FileWriter(String filepath)//创建字节输出流管道与源文件对象接通
public FileWriter(File file,boolean append)//创建字节输出流管道与源文件对象接通，可追加数据
public FileWriter(String filepath,boolean append)//创建字节输出流管道与源文件对象接通，可追加数据
    
void writer(int c)//写一个字符
void writer(String str)//写一个字符串
void writer(String str.int off, int len)//写入一个字符串的一部分
void writer(char []cbuf)//写入一个字符数组
void writer(char []cbuf, int off, int len)//写入字符数组的一部分
```

#### 3.缓冲流

- 缓冲字节输入流
- 缓冲字节输出流
- 缓冲字符输入流 BufferedReader

```java
public String readLine() // 读取一行数据返回 如果没有数据可读了 会返回null
```

- 缓冲字符输出流 BufferedWriter