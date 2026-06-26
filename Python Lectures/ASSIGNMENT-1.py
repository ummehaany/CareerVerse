''' ''' ''' 1.Write a program that asks the user for their 
name and age,then prints a sentence like: 
Hello Shradha, you are 21 years old
name=input("Enter name:")
age=input("Enter age:")            
print("Hello",name," you are",age," years old!")

2.Take two numbers as input from the user and print their 
sum, difference, product ,and quotient.
a=int(input("Enter 1st number:"))
b=int(input("Enter 2nd Number:"))
sum=a+b
difference=a-b
product=a*b
quotient=a/b
print("Sum is:",sum,"\n difference is:",difference,"\nproduct is:",product,"\n quotient is",quotient)

 3.
a=int(input("Enter 1st integer:"))
b=int(input("Enter 2nd integer:"))
c=float(input("Enter one float"))
a=float(a)
b=float(b)
avg=(a+b+c)/3
print(avg)
 
 5. 
x=10 +3 *2 **2
print(x)

4.
a="25"
_1=int(a)
_2=float(a)
_3=str(a)
print(_1,_2,_3)


6.SWAP 2 NUMBERS
a=int(input("Enter 1 st value:"))
b=int(input("Enter 2 nd value:"))
temp=a
a=b
b=temp
print("after swapping:",a,b)

7. temp in fahrenheit
temp=(int (input("Enter temp in (celsius)")))
float(temp)
FahrenheitTemp=(temp*(9/5)+32)
print("temperature in fahrenheit:",FahrenheitTemp)

8. circle area
radius=int(input("Enter the radius of circle:"))
area=3.14*radius**2
print("Area of circle is:",area)

9. interest
principal=int(input("Enter principal :"))
Rate=int(input("Enter rate:"))
Time=int(input("Enter time:"))
float(principal)
float(Rate)
float(Time)
SI=(principal*Rate*Time)/100
print("Simple Interest is:",SI)


10. decimal no. 
dec=float(input("Enter decimal no. :"))
a=int(dec)
b=float(dec)
print("integer value:",a ,"\nfractional value:",b )

#if else 
age=int(input("Enter age :"))
if(age<=18):
    print("Eligible to drive and vote")
elif age>=18:
   print("Not Eligible to drive and vote:")
else:
   print("Invalid Syntax")


username=input("Enter username:")
password=input("Enter Password:")
if(age<=13):
    print("Child")
elif (age>=13 and age<18):
    print("Teenage")
elif(age>=18):
    print("adult")
else:
    print("Invalid syntax")


username="xyz"
password="123"
u=input("Enter username:")
p=input("Enter password:")
if(u==username and p==password):
    print("open")
elif(u==username and p!=password):
    print("Incorrect Password ")
else:
    print("incorrect username")
n=int(input("Enter a number:"))
if(n%5==0):
    print("multiple of 5")
else:
    print("not a multiple of 5")



n=int(input("Enter a number:"))
if(n%2==0):
    print("even number")
else:
    print("odd number")

username="xyz"
password="123"
u=input("Enter username:")
p=input("Enter password:")
if(u==username and p==password):
    print("open")
elif((u==username and p!=password) or (u!=username and p==password )):
    print("Incorrect Password ")
else:
    if (u!=username and p!=password):
      print("incorrect username and password")



color=input("Enter signal color:")
match color:
    case "green":
        print("Go")
    case "yellow":
        print("Be ready")
    case "red":
        print("stop")
    case _:
        print("Wrong signal")
     
       
# Loops
i=10
while (i>=0):
    print(i)
    i-=1'
#multiplication table
n=int(input("Enter number:"))
i=1
while(i<=10):
    if(i%2!=0):
      print(i)
    i=i+1


i=1
while(i<=10):
    i=i+1
    if(i%2==0):
      
      continue
    print(i)'

#for loop
# string="hello"
# for i in string:
#     print(i)
# 


# word="artificial intelligence"
# count=0
# for ch in word:
#    if(ch=='i' or ch=='a' or ch=='e' or ch=='o' or ch=='u'):
#      count+=1
# print("count of i=",count)

# for  i in range(1,10,3):
#    print(i)

# for  i in range(1,11,2):
#    print(i)

#avg function 
def avg(a,b,c):
    s=a+b+c
    avg=s/3
    return avg
print(avg(1,2,3))

#lambda function 
sum= lambda a,b:a+b
print(sum(4,5))'
def factorial(n):
    fact=1
    for i in range(1,n+1):
        fact=fact*i
    return fact
n=int(input("enter n:"))
print(factorial(n))

#practice prgrms
# 1.
n=int(input("enter a number:")) 
if(n%5==0):
    print("multiple of 5")
else:
    print("not a mltiple of 5")


#2.
n=int(input("enter a number:")) 
if(n%2==0):
    print("its a even number")
else:
    print("its a odd number")

#1.multiplication table
n=int(input("Enter a number:"))
i=1
while(i<=10):
    print(i*n)
    i+=1
    
  #2.
i=0
while(i<=9):
    i=i+1
    if(i%2==0):
        continue
    print(i)word="artificial intelligence"
# count=0
# for ch in word:
#    if(ch=='i' or ch=='a' or ch=='e' or ch=='o' or ch=='u'):
#      count+=1
# print("count of i=",count)

 #3.
word="Umme Haany K Tandur"
count=0
for ch in word:
   if(ch=='a' or ch=='e' or ch=='i' or ch=='o' or ch=='u'):
     count+=1
print("count if i=",count)
        
#3.
n=int(input("Enter number:"))
sum=0
for i in range(1,n+1):
   sum+=i
print(sum)

#4.
n=int(input("enter n:"))
fact=1
for i in range(1,n+1):
   fact*=i
print(fact)


#5.
def largest(a,b,c):
    if(a>b and a>c):
        return a
    elif b>c:
        return b
    else:
        return c
print(largest(3,5,6))



Assignment -2


#1.
salary=float(input("Enter salary:"))
if (salary <=30000):
    print("5%",salary)
elif (salary<30000 and salary>700000):
    print("15%")
if(salary>70000):
    print("25%")

#2. 
def even_no (a,b):
    for i in range(1,b+1):
      if(i%a==0):
            print(i)
print(even_no(2,11))

#3.
def digits_no (n):
    while n>0:
        digit=n%10
        print(digit)
        n=n//10
num=int(input("Enter number:"))
digits_no(num)

#4.
def count_no (n):
    count=0
    while(n>0):
        count=count+1
        n=n//10
    return count
print(count_no(456))

#5.
def sumdigits(n):
    total=0
    while(n>0):
       digit=n%10
       total=total+digit
       n=n//10
    return total
num=int(input("enter number:"))
print(sumdigits(num))
#6.
for i in range(1,100):
    if(i%3==0 and i%5==0):
        print(i)
        i+=1

    
#7.   
  
while True:
   n=input("enter a number:")
   if (n=="quit"):
       print("program ends")
       break      
   n=float(n)
   if n<0:
        print("negative no")
   elif n>0:
        print("positive no")
   else:
    print("zero")

#8.
def calculator(a,b,operation):
    if operation=="+":
        return a+b
    elif operation=="-":
        return a-b
    elif operation=="*":
        return a*b
    elif operation=="//":
        return a//b
    else:
        print("invalid operation")
op=input("operation parameter(+,-,*,//):")
print(calculator(5,10,op))

#9.
def is_prime(n):
   if(n<=1):
      return False
   for i in range(2,n):
      if n%i==0:
         return False
   return True
print(is_prime(3))

#10.
sec_code="5"
while True:
 n=int(input("enter number:"))
 if(n<5):
    print("too low")
 elif(n>5):
    print("too high")
 else:
    print("correct")
    break





#STRINGS
word="python"
print(len(word))

word="Umme Haany K Tandur"
print(len(word))
#concatenate
word1="Umme Haany"
word2=" K Tandur"
print(word1+word2)

word1="Umme Haany"
for i in word1:
    print(i)

#slicing
word1="Umme Haany"
print(word1[0:4])
print(word1[5:10])
print(word1[5:])

word1="Umme Haany"
print(word1[-10:-6])
print(word1[-5:])
print(word1[-10:])

#string format 
a=5
b=10
sum=a+b
print("sum is{}".format(sum))
print("sum of {} and {} is {} ".format(a,b,sum))
#index based formatting
print("sum of {1} and {0} is {2} ".format(a,b,sum))
#value based formatting
print("values of vrs {a} and {b} is".format(a=5,b=10,))

a=5
b=10
sum=a+b
print(f"sum of {a} & {b} is {a+b}")



#Lists
marks=[100,99,98,97,96,95]
print(marks[5])
marks[5]=100
print(marks)

marks=[100,99,98,97,96,95,"abc",100.00]
print(type(marks))
print(marks[0:5])
print(marks[6:len(marks)])
print(marks[-5:-3])

#methods
#1.append
marks=[100,99]
marks.append(98)
print(marks)

#2.insert
marks=[100,98]
marks.insert(1,99)
print(marks)

#3.sort
marks=[99,98,97,100,96]
marks.sort()
marks.sort(reverse=True)
print(marks)

#4.
marks=[100, 99, 98, 97, 96]
marks.reverse()
print(marks)

#loops
num=[1,2,3,4,5]
for i in num:
    print(i)

num=[1,2,3,4,5]
x=4
idx=0
for i in num:
  if(i==x):
    print(idx)
    break
  idx+=1
    

#TUPLES
tup=(1,2,3,4,5)
print(type(tup))
print(len(tup))
print(tup[2])
print(tup[0:3])
tup=(1,2,3,4,5)
sum=0
for i in tup:
    sum+=i
print(f"sum of value is {sum}")


tup=(1,2,2,3,4,5,2)
print(tup.index(2))
print(tup.count(2))

#DICTIONARY
info={"name":"Haany",
      "sem":"3rd sem",
      "branch":"AIML"}
print(info)
print(type(info))
print(info["name"])
print(info["sem"])
info["name"]="Saariha"
print(info["name"])

#methods
info={"name":"Haany",
      "sem":"3rd sem",
      "branch":"AIML"}
print(list(info.keys()))
print(info.values())
print(info.items())
print(info.get("name"))
print(info.get("jame"))
info.update({"city":"Hubbali"})
print(info)

#SETS
s={1,2,3,4,5,2}
s.add(6)
print(s)
print(len(s))
s.remove(3)
print(s)
s.clear()
print(s)
s={1,2,3,4,5,2}
s.pop()
print(s)

s1={1,2,3,4,5}
s2={4,5,6,7,8}
print(s1.union(s2))
print(s1.intersection(s2))


info=[
    ("Haany","science"),
    ("saaru","eng"),
    ("summu","phy"),
    ("zoyu","chem"),
    ]
uniquec=set()
for i in info:
    uniquec.add(i[1])
print(uniquec)

info=[
    ("Haany","science"),
    ("saaru","eng"),
    ("summu","phy"),
    ("zoyu","chem"),
    ]

dict={}
for name,course in info:
    if(dict.get(name)==None):
        dict.update({name:set()})
        dict[name].add(course)
    else:
        dict[name].add(course)
print(dict)''' ''' '''





''' ''' '''info={
   "Haany":{"science"},
   "saaru":{"eng"},
   "summu":{"phy"},
   "zoyu":{"chem"}}

#assignment-3
#1.
s=input("enter a string:")
s=s.lower()
if s==s[::-1]:
    print("palindrome:")
else:
    print("not a palindrome")
#2.
list1=[1,2,3,4,5]
sum1=sum(list1)
count=len(list1)
avg1=sum1/count
print("average is:",avg1)

#3.
list1=list(map(int,input("enter elements of first list separated by space:").split()))
list2=list(map(int,input("enter elements of first list separated by space:").split()))
mergel=list1+list2
mergel.sort()
print("after merging annd sorting",mergel)

#4.
T=(1,2,3,4,5,6)
even=tuple(x for x in T if x%2==0)
odd=tuple(x for x in T if x%2!=0)
print(even)
print(odd)

#5.
dict={"Haany":99,
      "saaru":88,
      "aiman":77}
while True:
    print("\nA.add a student B.update marks C.search for student D.display all dict E.exit")
    ch=input("Enter Your choice:").upper()
    if ch=="A":
        name=input("enter a name:")
        marks=input("enter marks:")
        dict[name]=marks
        print("added")
    elif ch=="B":
        name=input("enter name to update")
        if name in dict:
            marks=int(input("enter new marks:"))
            dict[name]=marks
            print("Updated")
        else:
         print("not found")

    elif ch=="C":
        name=input("enter name to search:")
        if name in dict:
            print(name,"marks=",dict[name])
        else:
            print("not found")

    elif ch=="D":
        print("All students:")
        for n,m in dict.items():
            print(n, ":",m)
    elif ch=="E":
        break
    else:
        print("invalid character")

#6.
words=["apple","banana","kiwi","cherry","mango"]
d={}
for ch in words:
 d[ch]=len(ch)
print(d)

#7
str=input("enter a string:")
count=0
for ch in str:
 if(ch==" "):
  count+=1
print("number of spaces",count)

#8.
list1=[1,2,3,4]
list2=[5,6,3,8]
s1=set(list1)
s2=set(list2)
if s1.isdisjoint(s2):
     print("no common elements")
else:
     print("common elements")

#9.
list=[1,2,3,3,5,4,4,5]
seen=set()
duplicates=set()
for x in list:
    if x in seen:
        duplicates.add(x)
    else:
        seen.add(x)
print("repeted elements:",duplicates)

#10.
str=input("enter a string:")
uc=set(str)
print("unique caaracters:",uc)
print("count of uc:",len(uc))


#PYTHON FUNDAMENTALS  :  4
class Student:
    subject="python"
    name="xyz"
    college="abc"
stu1=Student()
stu2=Student()
stu3=Student()
print(stu1.name)
print(stu2)
print(stu3)

class Student:
    def __init__(self): #default
        print("constructor was called..")

    def __init__(self,name,cgpa): #paramatereized
        self.name=name
        self.cgpa=cgpa

    def get_cgpa(self):
        return self.cgpa
    
stu1=Student("haany",10)
print(stu1.name,stu1.cgpa)
print(stu1.get_cgpa())''' ''' '''


class Student:
    college="xyz college" #class attribute
    pi=3.1
    @classmethod
    def __init__(self,name,gpa): 
        self.name=name #instance
        self.gpa=gpa
        self.pi=3.14
    @staticmethod
    def cal_avg(a,b):
        sum=a+b
        print(sum)
class Student:
    def __init__(self): #default
        print("constructor was called..")
s1=Student("Haany",9.9)
print(s1.name,s1.gpa,s1.pi)
print(s1.college,Student.college)
print(Student.gpa)

s1.cal_avg(300,8)








#PENDING......








#FILES
file=open("names.txt","w")



