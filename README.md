# 说明

jquery.qform.js 是一个jquery插件。设计这个插件是为了在asp.net mvc中用悬浮气泡的形式取代默认验证形式。灵感来自[ASP.NET MVC: Displaying Client and Server Side Validation Using qTip Tooltips](http://nickstips.wordpress.com/2011/08/18/asp-net-mvc-displaying-client-and-server-side-validation-using-qtip-tooltips/)

[]() 可以看到更多说明和例子。

## 需求
 - [jQuery](http://jquery.com/)
 - [jquery.validate.js](http://jqueryvalidation.org/) - 老牌验证插件
 - [jquery.validate.unobtrusive.js](http://ajax.aspnetcdn.com/ajax/mvc/3.0/jquery.validate.unobtrusive.js) - 微软提供的插件。默认配置验证需要些js代码，用了这个插件只需要写html。[说明](http://kb.cnblogs.com/page/80652/)
 - [qTip2](http://craigsworks.com/projects/qtip2/) - 功能强大的提示插件。这里用到了一个小功能点：针对form的悬浮气泡验证形式。[说明](http://craigsworks.com/projects/qtip2/demos/#validation)
 - [Bootstrap](https://github.com/twitter/bootstrap)(可选) - 默认提供了对Bootstrap forms的支持。

## 使用

###通过data attributes启动

启用qform不需要写一行JavaScript。设置按钮元素的属性 `data-toggle="qform"` `data-target="#foo"` 或者 `href="#login-form"`，"#login-form"指向需要验证的form元素。按钮元素是否在form元素内部无关紧要。

    <!-- Button to trigger form -->
    <a data-toggle="qform" href="#login-form">登陆</a>

    <!-- form -->
    <form action="/Account/LogIn" data-form-redirect="/home/index" id="login-form" method="post">        
        <h2>Please sign in</h2>
        <input data-val="true" data-val-length-max="40" data-val-length-min="2" id="UserName" name="UserName" placeholder="UserName..." type="text" value="">
        <input data-val="true" data-val-length-max="20" data-val-length-min="6" id="Password" name="Password" placeholder="Password..." type="password">
    </form>

###通过JavaScript启动

    $("#login-form").qform();

会自动验证并提交form。

##data-api
设置form元素属性 `data-form-reset="false"` 默认会在提交form元素成功之后重置form元素的内容。使用这个api将会阻止这个行为。

设置form元素属性 `data-form-redirect="/"` 默认会用把form元素的请求转为ajax请求。这个api用来指定提交成功之后页面跳转的url。

##方法

###$("#login-form").qform("update");
更新form元素的验证规则。

例如：把用户名的验证规则从最小允许2个字符改为最小允许3个字符

    $("#UserName").attr("data-val-length-min", 3)
    $("#login-form").qform("update");

##事件

###post

验证并提交form前触发。例如：当密码为123456时，取消提交，并提示密码规则。

    $("#login-form").on("post", function(e){
        if($("#Password").val().trim() == "123456"){
            e.preventDefault();
            alert("密码太简单，请输入更加复杂的密码！");
        }
    });

###success

提交成功之后触发。例如：提示用户提交成功。

    $("#login-form").on("success", function(e){
        alert("提交成功！");		
    });

###finished

提交之后触发，不管成功或是失败。

    $("#login-form").on("finished", function(e){
        .....
    });
