/**
 * Created with JetBrains PhpStorm.
 * User: lixiao1
 * Date: 13-5-2
 * Time: 下午4:50
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function()
{
    $("#male").click(function()
    {
        $("#sex").val("1");
        $("#female").attr("checked",false);
    });
    $("#female").click(function()
    {
        $("#sex").val("2");
        $("#male").attr("checked",false);
    });
    var years=new Date().getFullYear();
    var blood=$("#bloodgroups");
    blood.append("<option value='0' style='display: none'></option>");
    blood.append("<option value='A型'>A型</option>");
    blood.append("<option value='B型'>B型</option>");
    blood.append("<option value='AB型'>AB型</option>");
    blood.append("<option value='O型'>O型</option>");
    var constellation=$("#constellation");
    constellation.append("<option value='0' style='display: none'></option>");
    constellation.append("<option value='白羊座'>白羊座</option>");
    constellation.append("<option value='金牛座'>金牛座</option>");
    constellation.append("<option value='双子座'>双子座</option>");
    constellation.append("<option value='巨蟹座'>巨蟹座</option>");
    constellation.append("<option value='狮子座'>狮子座</option>");
    constellation.append("<option value='处女座'>处女座</option>");
    constellation.append("<option value='天秤座'>天秤座</option>");
    constellation.append("<option value='天蝎座'>天蝎座</option>");
    constellation.append("<option value='射手座'>射手座</option>");
    constellation.append("<option value='摩羯座'>摩羯座</option>");
    constellation.append("<option value='水瓶座'>水瓶座</option>");
    constellation.append("<option value='双鱼座'>双鱼座</option>");
    var year=$("#year");
    year.append("<option value='0' style='display: none'></option>");
    var month=$("#month");
    var day=$("#day");
    for(var i=1900;i<=years;i++)
    {
        year.append("<option value="+i+">"+i+"</option>");
    }
    year.change(function()
    {
        if(month.text()=="")
        {
            month.empty();
            month.append("<option value='0' style='display: none'></option>");
            for(var i=1;i<=12;i++)
            {
                month.append("<option value="+i+">"+i+"</option>");
            }
        }
        else{
            var curday=0;
            if(day.text()!="")
            {
                curday=day.val();
            }
            day.empty();
            day.append("<option value='0' style='display: none'></option>");
            for(var i=1;i<=28;i++)
            {
                day.append("<option value="+i+">"+i+"</option>");
            }
            if(month.val()==2)
            {
                if((year.val() % 4 == 0 && year.val() % 100 != 0) || year.val() % 400 == 0)
                {
                    day.append("<option value='29'>29</option>");
                    if(curday==30||curday==31)
                    {
                        day.val(29);
                    }
                    else
                    {
                        day.val(curday);
                    }
                 }
                else
                {
                    if(curday==29||curday==30||curday==31)
                    {
                        day.val(28);
                    }
                    else
                    {
                        day.val(curday);
                    }
                }
            }
            else
            {
                if(month.val()==1||month.val()==3||month.val()==5||month.val()==7||month.val()==8||month.val()==10||month.val()==12)
                {
                    day.append("<option value='29'>29</option>");
                    day.append("<option value='30'>30</option>");
                    day.append("<option value='31'>31</option>");
                    day.val(curday);
                }
                else
                {
                    day.append("<option value='29'>29</option>");
                    day.append("<option value='30'>30</option>");
                    if(curday==31)
                    {
                        day.val(30);
                    }
                    else
                    {
                        day.val(curday);
                    }
                }
            }
        }
    });
    month.change(function()
    {
        var curday=0;
        if(day.text()!="")
        {
            curday=day.val();
        }
        day.empty();
        day.append("<option value='0' style='display: none'></option>");
        for(var i=1;i<=28;i++)
        {
            day.append("<option value="+i+">"+i+"</option>");
        }
        day.val(curday);
        if(month.val()==2)
        {
            if((year.val() % 4 == 0 && year.val() % 100 != 0) || year.val() % 400 == 0)
            {
                day.append("<option value='29'>29</option>");
                if(curday==30||curday==31)
                {
                    day.val(29);
                }
            }
            if(curday==29||curday==30||curday==31)
            {
                day.val(28);
            }
        }
        else
        {
            if(month.val()==1||month.val()==3||month.val()==5||month.val()==7||month.val()==8||month.val()==10||month.val()==12)
            {
                day.append("<option value='29'>29</option>");
                day.append("<option value='30'>30</option>");
                day.append("<option value='31'>31</option>");
                day.val(curday);
            }
            else
            {
                day.append("<option value='29'>29</option>");
                day.append("<option value='30'>30</option>");
                if(curday==31)
                {
                    day.val(30);
                }
            }
        }
    });

    var province=$("#province");
    province.append("<option style='display: none'></option>");
    var city=$("#city");
    $.post("/home/getProvince.html",function(data)
    {
        if(data.length>0)
        {
            for(var i=0;i<data.length;i++)
            {
                var obj="<option value="+data[i]['id']+">"+data[i]['name']+"</option>";
                $(province).append(obj);
            }
        }
    },"json");
    province.change(function()
    {
        city.empty();
        $.post("/home/getCity.html",{ province: province.val() }, function(data){
        if(data.length>0)
        {
            city.append("<option style='display: none'></option>");
            for(var i=0;i<data.length;i++)
            {
                var obj="<option value="+data[i]['id']+">"+data[i]['name']+"</option>";
                $(city).append(obj);
            }
        }
    },"json");
});

        var QQ=$("#QQ");
        QQ.keydown(function(e){
            if(e.keyCode<48 || e.keyCode>57)
            {
            return false;
            }
        });
        });

function validlength(obj,len)
{
    if(obj.length>len)
    {
        return true;
    }
    return false;
}

function saveInfoOnSubmit()
{
    var QQ=$("#QQ");
    if(validlength(QQ.val(),15))
    {
        alert("QQ超出15位号码限制，请重新输入！");
        return false;
    }
    var weibo=$("#weibo");
    if(validlength(weibo.val(),128))
    {
        alert("微博超出128位字符限制，请重新输入！");
        return false;
    }
    var introduce=$("#introduce");
    if(validlength(introduce.val(),256))
    {
        alert("我的简介超出256个字符限制，请重新输入！");
        return false;
    }
    return true;
}