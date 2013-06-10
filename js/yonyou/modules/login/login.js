/**
 * Created with JetBrains PhpStorm.
 * User: lixiao1
 * Date: 13-5-2
 * Time: 下午4:50
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function()
{
    /*if (navigator.userAgent.toLowerCase().indexOf("chrome") >= 0)
    {
        $(window).load(function()
        {
            $('input:-webkit-autofill').each(function()
            {
                var text = $(this).val();
                var name = $(this).attr('name');
                if(text.length>0)
                {
                    switch(name)
                    {
                        case "txtUser":$("#tipUser").css("display","none");
                            break;
                        case "txtPwd":$("#tipPwd").css("display","none");
                            break;
                        case "txtRegPwd":$("#tipRegPwd").css("display","none");
                            break;
                        case "txtRegUser":$("#tipRegUser").css("display","none");
                            break;
                    }
                }
                $('input[name=' + name + ']').val(text);
            });
            setTimeout(function(){
                $('input:-webkit-autofill').each(function()
                {
                    var text = $(this).val();
                    var name = $(this).attr('name');
                    $(this).after(this.outerHTML).remove();
                    $('input[name=' + name + ']').val(text);

                    if($.trim($("#txtUser").val()).length>0)
                    {
                        $("#tipUser").css("display","none");
                    }
                    if($.trim($("#txtPwd").val()).length>0)
                    {
                        $("#tipPwd").css("display","none");
                    }
                    if($.trim($("#txtRegUser").val()).length>0)
                    {
                        $("#tipRegUser").css("display","none");
                    }
                    if($.trim($("#txtRegPwd").val()).length>0)
                    {
                        $("#tipRegPwd").css("display","none");
                    }
                    if($.trim($("#txtRegPwd2").val()).length>0)
                    {
                        $("#tipRegPwd2").css("display","none");
                    }

                    $("#txtUser").focus(function()
                    {
                        $("#tipUser").css("display","none");
                        $("#errEmail").css("display","none");
                        $("#errPwd").css("display","none");
                    });

                    $("#txtUser").blur(function()
                    {
                        if($.trim($("#txtUser").val()).length==0)
                        {
                            $("#tipUser").css("display","block");
                            $("#txtUser").val("");
                        }
                    });

                    $("#txtRegUser").focus(function()
                    {
                        $("#tipRegUser").css("display","none");
                    });

                    $("#txtRegUser").blur(function()
                    {
                        if($.trim($("#txtRegUser").val()).length==0)
                        {
                            $("#tipRegUser").css("display","block");
                            $("#txtRegUser").val("");
                        }
                    });

                    $("#txtPwd").focus(function()
                    {
                        $("#tipPwd").css("display","none");
                        $("#errPwd").css("display","none");
                    });

                    $("#txtPwd").blur(function()
                    {
                        if($("#txtPwd").val().length==0)
                        {
                            $("#tipPwd").css("display","block");
                        }
                    });

                    $("#txtRegPwd").focus(function()
                    {
                        $("#tipRegPwd").css("display","none");
                        $("#pwdagain").css("display","block");
                    });

                    $("#txtRegPwd2").focus(function()
                    {
                        $("#tipRegPwd2").css("display","none");
                    });

                    $("#txtRegPwd").blur(function()
                    {
                        if($("#txtRegPwd").val().length==0)
                        {
                            $("#tipRegPwd").css("display","block");
                        }
                    });

                    $("#txtRegPwd2").blur(function()
                    {
                        if($("#txtRegPwd2").val().length==0)
                        {
                            $("#tipRegPwd2").css("display","block");
                        }
                    });
                });
            },30);
        });
    }*/

    if($.trim($("#txtUser").val()).length>0)
    {
        $("#tipUser").css("display","none");
    }
    if($.trim($("#txtPwd").val()).length>0)
    {
        $("#tipPwd").css("display","none");
    }
    if($.trim($("#txtRegUser").val()).length>0)
    {
        $("#tipRegUser").css("display","none");
    }
    if($.trim($("#txtRegPwd").val()).length>0)
    {
        $("#tipRegPwd").css("display","none");
    }
    if($.trim($("#txtRegPwd2").val()).length>0)
    {
        $("#tipRegPwd2").css("display","none");
    }

    $("#txtUser").focus(function()
    {
        $("#tipUser").css("display","none");
        $("#errEmail").css("display","none");
        $("#errPwd").css("display","none");
    });

    $("#txtUser").blur(function()
    {
        if($.trim($("#txtUser").val()).length==0)
        {
            $("#tipUser").text("输入邮箱或用户名");
            $("#tipUser").css("display","block");
            $("#txtUser").val("");
        }
        /*var str=$("#txtUser").val();
         $.post("/home/verityUser.html",{ email: str },function(data){
         if(data.length>0)
         {
         $("#emailErrtip").text(data);
         $("#errEmail").css("display","block");
         }
         },"text");*/
    });

    $("#txtRegUser").focus(function()
    {
        $("#tipRegUser").css("display","none");
        $("#errInput").css("display","none");
    });

    $("#txtRegUser").blur(function()
    {
        if($.trim($("#txtRegUser").val()).length==0)
        {
            $("#tipRegUser").css("display","block");
            $("#txtRegUser").val("");
        }
    });

    $("#txtPwd").focus(function()
    {
        $("#tipPwd").css("display","none");
        $("#errPwd").css("display","none");
    });

    $("#txtPwd").blur(function()
    {
        if($("#txtPwd").val().length==0)
        {
            $("#tipPwd").css("display","block");
        }
    });

    $("#txtRegPwd").focus(function()
    {
        $("#tipRegPwd").css("display","none");
        $("#errRegPwd").css("display","none");
        $("#pwdagain").css("display","block");
    });

    $("#txtRegPwd2").focus(function()
    {
        $("#tipRegPwd2").css("display","none");
        $("#errRegPwd2").css("display","none");
    });

    $("#txtRegPwd").blur(function()
    {
        if($("#txtRegPwd").val().length==0)
        {
            $("#tipRegPwd").css("display","block");
        }
    });

    $("#txtRegPwd2").blur(function()
    {
        if($("#txtRegPwd2").val().length==0)
        {
            $("#tipRegPwd2").css("display","block");
        }
    });

    $("#tipUser").click(function()
    {
        $("#txtUser").focus();
        $("#txtUser").val("");
    });

    $("#tipRegUser").click(function()
    {
        $("#txtRegUser").focus();
        $("#txtRegUser").val("");
    });

    $("#tipPwd").click(function()
    {
        $("#txtPwd").focus();
        $("#txtPwd").val("");
    });

    $("#tipRegPwd").click(function()
    {
        $("#txtRegPwd").focus();
        $("#txtRegPwd").val("");
    });

    $("#tipRegPwd2").click(function()
    {
        $("#txtRegPwd2").focus();
        $("#txtRegPwd2").val("");
    });

    $("#lbAgreement").click(function()
    {
        $("#errAgreement").css("display","none");
        var bln = !$("#chkAgreement").is(":checked");
        if(bln)
        {
            $("#chkAgreement").val("1");
        }
        else
        {
            $("#chkAgreement").val("0");
        }
        $("#chkAgreement").attr("checked",bln);
    });

    $("#lbAutocheck").click(function()
    {
        var bln = !$("#chkAutologin").is(":checked");
        if(bln)
        {
            $("#chkAutologin").val("1");
        }
        else
        {
            $("#chkAutologin").val("0");
        }
        $("#chkAutologin").attr("checked",bln);

    });

    $("#switchBtn").click(function()
    {
        if($("#switchBtn").text()=="注册>>")
        {
            $("#regDiv").css("display","block");
            $("#pwdagain").css("display","none");
            $("#loginDiv").css("display","none");
            $("#switchBtn").text("登录>>");
            $("#errInput").css("display","none");
        }
        else
        {
            $("#regDiv").css("display","none");
            $("#loginDiv").css("display","block");
            $("#switchBtn").text("注册>>");
            $("#errEmail").css("display","none");
            $("#errPwd").css("display","none");
        }
    });
});

function IsValidOnSubmit(){
    var str=$("#txtUser").val();
    var pwd=$("#txtPwd").val();
    var valid=true;
    var options = { type:"post",url:"/home/verityUser.html", data:{ email: str },
        async:false,success:function(data){
            if(data.length>0)
            {
                $("#emailErrtip").text(data);
                $("#errEmail").css("display","block");
                valid= false;
            }
        }
    };
    $.ajax(options);//发送验证请求
    if(valid)
    {
        options = { type:"post",url:"/home/verityPassword.html", data:{ email: str,pwd:pwd },
            async:false,success:function(data){
                if(data.length>0)
                {
                    $("#pwdErrtip").text(data);
                    $("#errPwd").css("display","block");
                    valid= false;
                }
            }
        };
    }
    $.ajax(options);//发送验证请求
    return valid;
}

function IsValidOnRegSubmit(){

    if($.trim($("#txtRegUser").val()).length==0)
    {
        $("#errInput").css("display","block");
        return false;
    }
    var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    if(!reg.test($("#txtRegUser").val()))
    {
        $("#errInput").css("display","block");
        return false;
    }
    if($.trim($("#txtRegPwd").val()).length==0)
    {
        $("#errRegPwd").css("display","block");
        return false;
    }
    if(validPwd($.trim($("#txtRegPwd").val())))
    {
        $("#errRegPwd").css("display","block");
        return false;
    }
    if($.trim($("#txtRegPwd2").val()).length==0)
    {
        $("#errRegPwd2").css("display","block");
        $("#regPwdErrtip2").text("请输入6-12位数字或字母");
        return false;
    }
    if(!validRePwd($.trim($("#txtRegPwd2").val()),$.trim($("#txtRegPwd").val())))
    {
        $("#errRegPwd2").css("display","block");
        $("#regPwdErrtip2").text("输入不一致，请重新输入");
        return false;
    }
    var bln = !$("#chkAgreement").is(":checked");
    if(bln)
    {
        $("#errAgreement").css("display","block");
        return false;
    }
    return true;
}

function validRePwd(firobj,curobj)
{
    if(firobj==curobj)
    {
        return true;
    }
    return false;
}

function validPwd(obj)
{
    var reg = /^[A-Za-z0-9]+$/;
    if(!reg.test(obj))
    {
        return true;
    }
    if(obj.length<6||obj.length>12)
    {
        return true;
    }
    return false;
}