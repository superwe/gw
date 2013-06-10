/**
 * 动态的入口js
 * @required jQuery YonYou YonYou.util
 */
(function($, YY, util){
    
    var doc = document;




/**
 *一些共用方法 库。
 */
var coreFun = {
    showForSpeech:"请输入#选择主题",
    addNotice:function($form){
        $form.find("div[contenteditable=true]").find("a").each(function (){
            $(this).attr("href",$(this).attr("for"));
            if($(this).attr("category")==10){
                var input = '<input type="hidden" value="<%=id%>" ele-role="member-id" name="atperson[]"></input>';
                var id = $(this).attr("member_id");
                $form.append(input.format({id:id}));   
            }
        })
    },
    getArgument:function (name){
        var href = document.location.href,
            l = href.lastIndexOf(name),
            str = "";
        if(l<0){
            return ;
        }
        str = href.substring(l,href.length);
        return str.split("/")[1].replace("#","");
    },
    /**
     * 直接at某人时触发
     * @return {[type]} [description]
     */
    directeAt : function (){
        var id = this.getArgument("joinuser"),
            name = this.getArgument("juname"),
            url = "/space/cons/index/id/<%=id%>";
            html = '<a class="ya_contentA iconY_01" ele_role="need" tabindex="-1" category="10" for="<%=url%>" default="<%=name%>" member_id="<%=id%>"><%=name%></a>&nbsp;'
        if(!id){
            return ;
        }
        url = url;
        url = url.format({id:id});
        html = html.format({id:id,name:decodeURI(name),url:url});
        $("#content_div").html(html);
        this.showForSpeech = html;
        this.fouseEnd();
        // $("#content_div").trigger("click");
    },
    directeShap : function (){
        var id = this.getArgument("topic_id"),
            url = '/topic/topic/convs/topic_id/<%=id%>',
            name = $("#yy_topicDetial_title").html();
        if(!id){
            return ;
        }
        url = url;
        url = url.format({id:id});
        html = this.buildTopic({id:id,name:decodeURI(name),url:url});
        $("#content_div").html(html);
        this.fouseEnd();
    },
    gTopic:function(option){
        var url = '/topic/topic/convs/topic_id/<%=id%>';
        url = url.format({id:option.id});
        html = this.buildTopic({id:option.id,name:decodeURI(option.name),url:url});
        $("#content_div").html(html+"&nbsp;");
    },
    deleTarget:function (_this){
        var self = this;
        var jdom = $(_this);
        jdom.find('.child').each(function(index, node) {
            while (!$(this).parent().is(jdom)) {
                $(this).unwrap();
            }
        });
        if (jdom.html().indexOf('\n') !== -1) {
            jdom.html(jdom.html().replace('\n', ''));
        }
        var html = "";
        jdom.children().each(function(i, dom) {
            if ($(dom).attr("ele_role")=="need") {
                return;
            }
            if ($(dom).is('br')) {
                return;
            }
            if ($(dom).css('display') === 'block') {
                if ($.browser.webkit) {
                    $(dom).before('<br />');
                } else if (i > 0) {
                    $(dom).before('<br />');
                }
            }
            $(dom).replaceWith(self.deleTarget(dom).html());
        });
        
        jdom.trigger("valueChange");
        return jdom;
    },
    paste:function (_this){
        var jdom = $(_this);
        // $(_this).closest("form").find("#upload-div").slideDown();
        this.deleTarget(_this);
        jdom.trigger("cursorChange");
    },
    buildTopic:function (obj){
       var html = '<a class="ya_contentA icoHt" tabindex="-1" category="45" for="<%=url%>" default="<%=name%>" ele_role="need"><%=name%></a>';
       return html.format(obj);
    },
    fouseEnd:function(){
        editorObj.focusEnd();
        editorObj.rememberCurrentRange(); 
        $("#content_div").blur();        
    },
    autoLoadTeam:function (data){
        var html = "";
        var obj = [
            ['<span class="iconY_01 tkIcoBox "></span>'],
            ['<li class="tline" style="height:0px"></li><span class="iconY_02 tkIcoBox "></span>'],
            ['<li class="tline" style="height:0px"></li><span class="iconY_03 tkIcoBox "></span>'],
            ['<li class="tline" style="height:0px"></li><span class="iconY_04 tkIcoBox "></span>'],
            ['<li class="tline" style="height:0px"></li><span class="iconY_05 tkIcoBox "></span>'],
            ['<li class="tline" style="height:0px"></li><span class="iconY_06 tkIcoBox "></span>'],
            ['<li class="tline" style="height:0px"></li><span class="iconY_07 tkIcoBox "></span>'],
            ['热门主题：'],
            ['<li style="height:0px" class="tline"></li>热门话题：']
        ];
        function template(obj,flag){
            if(flag == 2){
                var topic = [],
                    theme = [];
            }
            var temp = $("#auto_category_list").html(),
                tempArray = temp.split("_|_"),
                flag = flag||0;
                tempOne = tempArray[flag];
                //email太长截取。
                var email = obj.other3;
                if(email.length>15){
                    obj.other3 = email.substring(0,15)+"...";
                }
            return tempOne.format(obj);
        }
        if(data){
            for(var i = 0,j=data.length;i<j;i++){
                var one = data[i],
                    category = one.category;
                    one.value=one.value;
                switch(parseInt(category)){
                    case 10:
                    obj[0].push(template(one));break;
                    case 40:
                    obj[1].push(template(one,1));break;
                    case 50:
                    obj[2].push(template(one,1));break;
                    case 25:
                    obj[3].push(template(one,1));break;
                    case 35:
                    obj[4].push(template(one,1));break;
                    case 65:
                    obj[5].push(template(one,1));break;        
                    case 3233:
                    obj[6].push();break;
                    case 45:
                        if(one.other1==1){
                            obj[7].push(template(one,2));break; 
                        }else{
                            obj[8].push(template(one,2));break;
                        }
                }
            }
            for(var i = 0,j = obj.length;i<j;i++){
                if(obj[i].length>1||(i==7&&obj[i].length>2)){
                    html += obj[i].join("");
                }
            }
        }else{
            html = "无相关话题。";
        }
        return html;
    },
    addTopicFor:function ($all){
        $all.each(function (){
            var $this = $(this),
                id = $(this).find(".yj-tag-name").attr("data"),
                name = $(this).find(".yj-tag-name").html();
                exp = /^(0|[1-9]\d*)$/;
             if(exp.test(id)){
                 $this.closest("ol").append("<input type='hidden' value='"+id+"' name='topicIsId[]'>");
             }else{
                 $this.closest("ol").append("<input type='hidden' value='"+name+"' name='topicIsStr[]'>");
             }
        })
    }
}






    // DOM Ready
    $(function(){
        var $doc = $(doc),
            $speechForm = $("#speechForm");     // 发言表单

        $speechForm.bind("submit", function() {

            // $("#group_sf").val(combo.val('fyd'));
        });

        // // 处理发言私密群组点击
        // $("#aside_fyd").find("a").live("click",function (event){
        //     var target = event.target;
        // })
        
        // var position = 0;
        // var speech = {
        //     addPositon : function(num){
        //         position+num;
        //     },
        //     clearForm : function (){
        //     }
        // };
        /**
         * document上的绑定事件;
         * 表情触发：.face-trigger
         * 发言：.speech-form
         * 回复：.reply-form
         * 
         */
        $doc.on({
            // 表情弹出层隐藏问题
            'click': function(e){
                var $target = $(e.target),
                    $realTarget = null;
                // 显示表情
                if ($target.is('.face-trigger')) {
                    showFaces();
                    return false;
                }
                // 添加表情
                if ($target.closest('#facesList').length){
                    addFace();
                    return false;
                }
                // 隐藏表情
                hideFaces();
            },
            'submit': function(e){
                var $target = $(e.target);
                // 提交发言;
                if ($target.is('.speech-form')) {
                    submitSpeechForm($target);
                    return false;
                }
                // 回复
                if ($target.is('.reply-form')) {
                    submitReplyForm($target);
                    return false;
                }
            }
        });
        // 显示表情
        function showFaces(){

        }
        // 隐藏表情
        function hideFaces(){
            $('#facesList').remove();
        }
        // 添加表情
        function addFace(){

        }

        var editorObj = new YY.speechEditor({
            selector:"#content_div"
        });
        var faceObj = new speeh_face({
                selector  :"#face_id",
                trigger   :"#face_trigger",
                toElement :"#content_div",
                editor    :editorObj
        })
        editorObj.bind();
        editorObj.barBind(complete);
        // autocomplete对象实例;
        var complete = new autocomplete({
            text:"#content_div",
            content:"#auto_content,#auto_content_topic",
            target:"",
            container:"",
            editor: editorObj,
            position:{
                height:22,
                width:-37
            },
            select:function (val){
                editorObj.insertObj(val);
            },
            load:function (data,autoObj,preValue){
                var html = coreFun.autoLoadTeam(data);
                // if(!data)return;
                if(editorObj.target=="@"){
                    if(html=="")return ;
                    $(autoObj.content).find("#auto_content_list").html(html);
                }else{
                    complete.content = "#auto_content_topic";
                    $(autoObj.content).find("#auto_content_list").html(html);
                }
            },
            search:function (value,autoObj){
                try{
                    var seachObj = editorObj.getSearch();
                    if(!seachObj||seachObj.searchContent.indexOf(" ")!=-1)return null;
                    autoObj.content  = seachObj.content;
                    if(seachObj.keyWord=="#"){
                        $(seachObj.content).find("#yy_create_topic").html(seachObj.searchContent);
                    }
                    // complete.dPos = editorObj.cursorPosition();
                    return  (editorObj.searchContent = seachObj.searchContent);
                    
                }catch(e){}
            }
        });
        try{
            $("#content_div").focus();
            editorObj.rememberCurrentRange(); 
            $("#content_div").blur();
        }catch(e){}

        $("#speechForm").live("submit",function (){
            
            var self = this;
            var $content = $("#content_div");
            coreFun.addNotice($(self));
            if($content.html()==""){
                return false;
            }
            //群组
            $content.find("img").each(function (){
                $(this).attr("src",YY.util.url($(this).attr("src")));
            })
            //
            coreFun.deleTarget($content[0]);
            //话题关联
            $content.find("a").each(function(){
                var typeId = $(this).attr("category");
                if(typeId=="45"){
                    var array = $(this).attr("for").split("/"),
                        l = array.length;
                    if(array[l-1]){
                         $(self).append("<input name='topic_div_value[]' type='hidden' value="+array[l-1]+" />");
                    }
                }
                if(typeId == "40"){
                    var array = $(this).attr("for").split("/"),
                        l = array.length;
                    if(array[l-1]){
                         $(self).append("<input name='groupids_for_notice[]' type='hidden' value="+array[l-1]+" />");
                    }
                }
                $(this).removeAttr("style");
            })
            $("#speech_content").val($content.html());
            $("[role=listbox]").hide();
            $("[role=layer]").hide();
            var a = 0;
            for(var i =0,j=1000;i<j;i++){
                a = a+1;
            }
        });
        
        //回复框编辑器 。
        var replayEditor = function (option){
            this.selector = option.selector;
            replayEditor.superclass.constructor.call(this, option);
            this.type="replayEditor";
        }
        YY.util.extend(replayEditor,editor);
        //回复框绑定事件
        replayEditor.prototype.bind = function (){
            var self = this;
            $(this.selector).live({
                click:function (event){
                    self.dom = event.target;
                    self.$dom = $(event.target);
                    self.rememberCurrentRange();
                },
                keyup:function (event){
                    
                    var keyCode = event.keyCode,
                        target  = event.target;
                    $(this).find("a").each(function (){
                        if($(this).html()==""){
                            $(this).remove();
                        }
                    });
                    if(keyCode!=8&&keyCode!=46){
                        $(this).find("a").each(function (){
                            if($(this).attr("default")!=$(this).html()){
                                $(this).html($(this).attr("default"));
                                self.focusNodeAfter(this);
                            }
                        })
                    }else{
                        $(this).find("a").each(function (){
                            if($(this).attr("default")!=$(this).html()){
                                var $this = $(this),
                                    $parent = $this.parent();
                                $this.remove();
                                if($.browser.mozilla&&$parent.html()==""){
                                   $parent.html("<br/>");
                                }
                            }
                        });
                    }
                    $(target).trigger("cursorChange");
                    self.countWord();
                    e.stopPropagation();
                }, 
                keydown:function (event){
                    event.stopPropagation();
                },          
                cursorChange: function(e) {
                    var r = self.rememberCurrentRange();
                },
                valueChange:function (e){
                    self.countWord();
                    self.focusEnd(e.target);
                }
            })
        }
        //绑定回复编辑器下的工具条。
        replayEditor.prototype.barBind = function (){
            var self = this;
            function addChar(single){
            }
            $(".yy_replay_at").live('click',function (event){
               $target =  $(event.target).closest("form").find("div[contentEditable=true]");
                var single= "@";
                self.insetText(single,$target,"#auto_content_replay");
            });
        }
        replayEditor.prototype.countWord = function(){
                var str = this.$dom.html();
                if(!str){
                    this.$dom.closest("aside").find("#yy_wordConut").html('210');
                    return ;
                }
                str = str.replace(/<a[^>]*>/gi,'')
                    .replace(/<\/a[^>]*>/gi,'')
                    .replace(/[\u4E00-\u9FA5]/gi,'!!')
                    .replace(/\<img[\s\S]*?\/?\>/ig,'!!!!')
                    .replace(/<br[^>]*>/gi,'')
                    .replace(/\&nbsp;/gi," ");
                var num = 210-Math.floor(str.length/2);
                this.$dom.closest("aside").find("#yy_wordConut").html(num);
        }
        // 回复地方的单列对象。
        var replay = {
            showFaces:function (){
                
            },
            hideFaces:function (){
                
            },
            faceObj : null,
            editor:null,
            autocomplete:null,
            initFaces:function (){
                this.faceObj = new face({
                    trigger:".yy_face_sh",
                    selector:".yy-feedFaceUl",
                    toElement:"yy-contentDiv",
                    relative:"form",
                    editor:this.editor
                })
            },
            initEditor:function(){
                var self = this;
                this.editor = replayface =  new replayEditor({
                    selector:".yy-contentDiv"
                })
                this.editor.bind();
                this.editor.barBind();
                this.autocomplete = new autocomplete({
                    text:".yy-contentDiv",
                    content:"#auto_content_replay",
                    target:"@",
                    container:"",
                    editor:self.editor,
                    position:{
                        height:37,
                        width:0
                    },
                    select:function (val){
                        if (window.getSelection) {
                               var sel = self.editor.getSelection();
                               sel.removeAllRanges();
                               var r = self.editor.resume();
                               var endContainer = r.endContainer;
                               var txtNode = document.createTextNode('\xa0');
                               var dom = self.editor.chooseOne(val);
                               l = endContainer.textContent.lastIndexOf("@");
                               endContainer.textContent = endContainer.textContent.substring(0,l);
                               self.editor.focusNodeAfter(endContainer);
                               self.editor.insertNode(dom);
                               $(dom).after(txtNode);
                               self.editor.focusNodeAfter(txtNode);
                               self.editor.setFocus();
                               self.editor.cursorChange();
                        } else if (document.selection && document.selection.type != "Control") {
                               var r = self.editor.resume(),
                                    dom = self.editor.chooseOne(val),
                                    html = dom.outerHTML || dom.nodeValue;
                               var range = r.duplicate();
                               self.editor.removeAt(range);
                               r = self.editor.resume();
                               r.pasteHTML(html);
                               self.editor.cursorChange();
                        }
                    },
                    load:function (data,autoObj,preValue){
                        var html = coreFun.autoLoadTeam(data);

                        if(html=="")return ;
                        $("#auto_content_replay").find("#auto_content_list").html(html);
                    },
                    search:function (value,autoObj){
                        try{
                            var seachObj =self.editor.getSearch();
                            if(!seachObj||seachObj.searchContent.indexOf(" ")!=-1)return;
                            autoObj.content  = seachObj.content;
                            if(seachObj.keyWord=="#"){
                                $(seachObj.content).find("#yy_create_topic").html(seachObj.searchContent);
                            }
                            return  (editorObj.searchContent = seachObj.searchContent);
                        }catch(e){}
                    }
                });
            }
        }
        replay.initEditor();    
        replay.initFaces();
        //直接at某人时促发。
        coreFun.directeAt();
        //直接添加话题。
        coreFun.directeShap();
    });
}(jQuery, YonYou, YonYou.util));