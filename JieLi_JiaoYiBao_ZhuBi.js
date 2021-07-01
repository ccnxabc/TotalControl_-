//为了中文不乱码
<script type="text/javascript" charset= "UTF-8"></script>
//荣耀V8 4G+64G，1 9 2 0*1 0 8 0
//荣耀V8 4G+32G，2 5 6 0*1 4 4 0
//必须是黑底色


var HEIGHT=-1
var  WIDTH=-1

d=new Date()
yyyy=d.getFullYear().toString()
mm=(d.getMonth()+1).toString()
dd=d.getDate().toString()
HH=d.getHours().toString()
MM=d.getMinutes().toString()
SS=d.getSeconds().toString()
//使用ringojs往电脑本地写文件
var fs = require('fs')

ZhuBi_file="d:\\ZhuBi"+"_"+yyyy+"_"+mm+"_"+dd+"_"+HH+"_"+MM+"_"+SS+".csv"
print(ZhuBi_file)

//新建一个文件
textStream = fs.open(ZhuBi_file, {binary: false,write: true})


var device=Device.getMain()

if(device.model=="KNT-AL20")
{
    HEIGHT=2560
    WIDTH=1440
}
else if(device.model=="KNT-AL10")
{
    alert("Error.NOT HonorV8 4G+64G!");
    HEIGHT=1920
    WIDTH=1080
}
else
{
    alert("Error.NOT HonorV8 4G+64G!");
}

float_HangJianGe_BiLi=0.0704
int_MeiYe_HangShu=9

//第一组30个数据，分别移动（1）9行数据，（2）9行数据，（3）1行数据，（4）1行数据，（5）1行数据
//后续的第N组30个数据，分别移动（1）9行数据，（2）9行数据，（3）9行数据，（4）1行数据，（5）1行数据，（6）1行数据
COUNT_MOVE_LINE_9=1
//所有第N组30个数据，都移动3次1行数据
COUNT_MOVE_LINE_1=0

START_2_LOOP_INDEX=0

while(1)
{
	BOTTOM_DATA=0
	ret=device.waitForColor(1440*0.025,2560*0.89,1440*0.17,2560*0.910,"0x88929e",0,1,2)
	//判断是最底部(数据最旧）的一页数据时
	if (ret != null)
	{		
		BOTTOM_DATA=1
		print("**Here is BOTTOM DATA!")
		textStream.write("**Here is BOTTOM DATA!\r\n")
	}

	//20210619最底部(数据最旧）的一页数据和非最底部数据，统一识别区域（把以前区域扩大）
	//如果是最底部数据，识别多一行（BOTTOM_DATA变为1）数据
	for(temp_i=START_2_LOOP_INDEX;temp_i<int_MeiYe_HangShu+BOTTOM_DATA;temp_i++)
	{
		str_time="-"
		str_price="-"
		str_amount="-"
		str_borker_code="-"
		str_direct="-"
		temp="-"
		
		//WIDTH*0.147已经隔离时间后面带U/Y等情况
		temp=device.analyzeText(WIDTH*0.015,HEIGHT*(0.266+float_HangJianGe_BiLi*temp_i),WIDTH*0.147,HEIGHT*(0.3+float_HangJianGe_BiLi*temp_i),"eng","number")
		if(temp!="")
			str_time=temp
		
		temp=device.analyzeText(WIDTH*0.33,HEIGHT*(0.266+float_HangJianGe_BiLi*temp_i),WIDTH*0.54 ,HEIGHT*(0.3+float_HangJianGe_BiLi*temp_i),"eng","number")
		if(temp!="")
			str_price=temp
			
		//175-----是1万
		//解决方法希望是英文版本,但是没有英文
		temp=device.analyzeText(WIDTH*0.60,HEIGHT*(0.266+float_HangJianGe_BiLi*temp_i),WIDTH*0.77,HEIGHT*(0.3+float_HangJianGe_BiLi*temp_i),"eng","number")
		if(temp!="")
		{
			str_amount=temp
			//print("str_amount:")
			//print(str_amount)
			if(str_amount.slice(-2)=="75")
			{
				str_amount=(parseFloat(str_amount.substr(0,str_amount.length-2))*10000).toString()
				//print("NEW str_amount:")
				//print(str_amount)
			}
		}
		
	
		temp=device.analyzeText(WIDTH*0.84,HEIGHT*(0.266+float_HangJianGe_BiLi*temp_i),WIDTH*0.98,HEIGHT*(0.3+float_HangJianGe_BiLi*temp_i),"eng","number")
		if(temp!="")
			str_borker_code=temp
		
		//绿色，方向向下，卖出
		ret=device.waitForColor(WIDTH*0.77,HEIGHT*(0.266+float_HangJianGe_BiLi*temp_i),WIDTH*0.80,HEIGHT*(0.3+float_HangJianGe_BiLi*temp_i),"0x289040",0,1,0.5)
		if (ret != null)
		{
			str_direct="DOWN"
		} 
		else
		{
			//红色，向上，买入
	  	ret=device.waitForColor(WIDTH*0.77,HEIGHT*(0.266+float_HangJianGe_BiLi*temp_i),WIDTH*0.80,HEIGHT*(0.3+float_HangJianGe_BiLi*temp_i),"0xFF3F47",0,1,0.5)
			if (ret != null)
			{
				str_direct="UP"
			}
			else
				str_direct="OTHER"
		}
		
		print(str_time+","+str_price+","+str_amount+","+str_direct+","+str_borker_code)
		textStream.write(str_time+","+str_price+","+str_amount+","+str_direct+","+str_borker_code+"\r\n")
	}
	
	if(START_2_LOOP_INDEX!=0)
	{
		print("**Adjust Print OK!")
		textStream.write("**Adjust Print OK!\r\n")
	}
	
	str_latest_record_HOUR=str_time.split(":")[0]
	str_latest_record_MINUTE=str_time.split(":")[1]
	
	if(BOTTOM_DATA==0)
	{
		if(COUNT_MOVE_LINE_9<3)
		{
			//向上滑动9行数据
			device.swipe([720,2048],[720,395],0)
			COUNT_MOVE_LINE_9=COUNT_MOVE_LINE_9+1
			START_2_LOOP_INDEX=0
			
			if(str_latest_record_HOUR=="09")
			{
				if(parseInt("str_latest_record_MINUTE",10)<40)
					//9:40-9:30随时会遇到最底部数据，必须延迟让数据加载完毕，再进行分析
					delay(5000)
			}
			else if(str_latest_record_HOUR=="16")
			{
				if(parseInt("str_latest_record_MINUTE",10)<20)
					//暗盘时间16::20-16:15随时会遇到最底部数据，必须延迟让数据加载完毕，再进行分析
					delay(5000)
			}
			else
				delay(2000)
		}
		else
		{
			device.swipe([720,2048],[720,1835],0)
			delay(1000)
			device.swipe([720,2048],[720,1835],0)
			delay(1000)
			device.swipe([720,2048],[720,1835],0)
			//为数据请求加载延迟3秒
			delay(3000)

			//经验值，后续要改成程序检测
			for(i=0;i<16;i++)
				device.scroll(720, 2048, 0, -1)
			
			if(str_latest_record_HOUR=="09")
			{
				if(parseInt("str_latest_record_MINUTE",10)<40)
					//9:40-9:30随时会遇到最底部数据，必须延迟让数据加载完毕，再进行分析
					delay(5000)
			}
			else if(str_latest_record_HOUR=="16")
			{
				if(parseInt("str_latest_record_MINUTE",10)<20)
					//暗盘时间16::20-16:15随时会遇到最底部数据，必须延迟让数据加载完毕，再进行分析
					delay(5000)
			}
			else
				delay(2000)
				
			print("**Adjust Finish!")
			textStream.write("**Adjust Finish!\r\n")
			
			START_2_LOOP_INDEX=6

			COUNT_MOVE_LINE_9=0
		}
	}	
	else
		//已到最底部一页（数据最旧），中断循环
		break
	
	//最底部一页（数据最旧）是P
	//P的上一页是P+1
	
	//假设P+1的内容是
	// A
	// B
	// C
	// D  <-----
	// E  <-----
	
	//假设P的内容是
	// D  <-----
	// E  <-----
	// F
	// G
	// H
	
	//人工来合并数据吧，数据量少（最多9条）编程麻烦，性价比不高！
	
}

textStream.close()
