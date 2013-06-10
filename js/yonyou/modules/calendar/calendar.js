/**
 * 日历模块
 * @required YY, YY.util, YY.date, YY.SimpleDialog, YY.hash, hashchange
 */
(function($, YY, util){
    YY = YY || {};
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    util.fix2Length = typeof util.fix2Length === 'function'
                    ? util.fix2Length
                    : function(str) {
                        str = str.toString();
                        return str.length < 2 ? '0' + str : str;
                    };
    /**
     * 默认按照10进制整型解析;
     * @return {[type]} [description]
     */
    var intParse = function(str, radix){
        radix = radix || 10;
        return parseInt(str, radix);
    };

    /**
     * 将时刻字符串格式化成10进制数字;
     * @param  {[type]} time_str [description]
     * @return {[type]}          [description]
     */
    function formatTime2Num(time_str) {
        var ret = 0;
        if (!!time_str) {
            var time = time_str.split(':'),
                hour = parseInt(time[0], 10),
                min  = parseInt(time[1], 10);
            min = min ? min : 0;
            ret = hour + min/60;
        }
        return ret;
    }
    var dataURI = util.url('/employee/calendar/ajaxData');    
    /**
     * 日历控件;
     * @author bull qiutao@chanjet.com
     */
    var calendar = YY.calendar = {
        // 初始化日历组件;
        init: function(type, timestamp){
            var me = this;
            
            me.setUid();         // 设置当前登录用户的实际id;
            me.setSelfid();      // 设置selfid
            me.initTaskColor();  // 初始化task条的颜色;
            me.setShowType(type);// 设置初始化展示类型;
            me.initShowType = me.showType;// 设置初始化showType值;

            me.initCalendar(timestamp);//初始化日历....绘制当前月的日历;
            me.initEventHandler();//初始化事件绑定;
            // setTimeout(function(){
                me.initSimpleDialog();// 初始化一个SimpleDialog以备用
            // }, 100);
        },
        reInit: function(type, timestamp) {
            var me = this;
            
            me.setSelfid();      // 设置selfid
            me.setShowType(type);// 设置初始化展示类型;
            me.initShowType = me.showType;// 设置初始化showType值;

            me.initCalendar(timestamp);//初始化日历....绘制当前月的日历;
        },
        getId:function (){
            var i = 0;
            return function (){
                return i++;
            };
        },
        /**
         * 初始化 日程、任务..等的颜色条;
         */
        initTaskColor: function(){
            var me = this;
            me.taskcolor = me.bg_color[0];
            me.taskcolor2 = me.bg_color[2];
            me.schecolor = me.bg_color[1];
            me.schecolor2 = me.bg_color[3];
        },
        /**
         * 设置颜色属性;
         * @param {[type]} color_options [description]
         */
        setTaskColor: function(color_options) {
            if (typeof color_options === 'object' && !!color_options.length) {
                var me = this;
                $.each(color_options, function(k, v){
                    me[k] = v;
                });
            }
        },
        /**
         * 初始化日历;
         */
        initCalendar: function(timestamp){
            var me = this;
            
            // 初始化当前日期，包括 me.month, me.week, me.day 以及 me.fixed_date;（只在此调用了一次）
            me.initDate(timestamp);
            me.initRequestData(); //设置初始化请求数据；---这个需要在初始化当前日期之后调用;
            // 显示日历视图;
            me.showView();
            var showType = me.showType;

            // 设置location.hash
            YY.hash.set('m='+showType+'&t='+me.day[0]);

            me.activeMode($('#'+showType+'Calendar'));

            // var $item_list = $('.yy-user-item'),
            //     $item = $item_list.filter('[mid="' + me.mid + '"]');
            // !!$item.length 
            //     ? me.setCalendarTitle($item) 
            //     : me.setCalendarTitle($item_list.filter('#yySelfItem'));
            // me.setClickTaskUrl();

            // me.showType = me.viewType[0];
            // me.showMonth(); //显示当前月的月历;
            me.initTask();  //初始化task相关属性（需要在基本日历完成之后...）;
            me.getInitData();//获取初始化数据，然后画出task条（暂时这么处理..）;
            // util.trace(me)
        },
        /**
         * 设置日历显示类型（分为 月、周、日）;
         * @param {[type]} type [description]
         */
        setShowType: function(type) {
            var me = this;
            switch(type) {
                case 'day':
                    me.showType = me.viewType[2];
                break;
                case 'week':
                    me.showType = me.viewType[1];
                break;
                case 'month':
                default:
                    me.showType = me.viewType[0];
                break;
            }
        },
        /**
         * 获取当前日历显示类型（分为 月、周、日）;
         * @return {[type]} [description]
         */
        getShowType: function() {
            var me = this;
            return me.showType;
        },
        reSize: function(){
            var me = this;
            me.openCalendarView(me.showType);
        },
        dataURI: dataURI,
        setDataURI: function(uri){
            var me = this;

            me.dataURI = uri || util.url('/employee/calendar/ajaxData');
        },
        hash: '',  // 保存日历当前的hash串
        /**
         * 获取基础hash串，即m和t组成的串
         * @return {[type]} [description]
         */
        getHashBase: function(){
            var me = this,
                hash = YY.hash,
                hash_str = hash.get(),
                params = hash.parse(hash_str);

            return 'm='+params['m']+'&t='+params['t'];
        },
        uid: 0,    // 表示当前登录用户的实际id;
        selfid: 0, // 用户id，主要用来区分不同日历的颜色（当为本人和共享人的时候为激活用户Id，否则为当前登录用户id）
        mid: 0,    // 当前日历用户的id（0也表示当前登录用户）
        // 今天的年、月、日 和 星期;
        today: {
            year: 0,
            month: 0,
            day: 0,
            week: 0,
            week_name: '',
            timestamp: 0,
            ref : null
        },
        viewType:['month','week','day'],
        month: [0,0],//月历起止时间;
        fixed_date: [0,0],//修复后的月时间戳，包括非当前月的灰色部分;(可包括2个元素，分别表示起止时间)
        mini_date: [0,0],
        week : [0,0],//周历起止时间;
        week_name: ['周日','周一','周二','周三','周四','周五','周六'], 
        week_name2:['星期日','星期一','星期二','星期三','星期四','星期五','星期六'], 
        day  : [0,0],//日历起止时间;
        time: [],
        hour_height: 42,
        onehalfhour: 1800,
        onehour: 3600,
        oneday: 86400,
        oneweek: 604800,
        timeblock: 3628800,//6*oneweek
        // 蓝色-黄色-绿色-土黄色-红色
        bg_color:['colorBg01','colorBg02','colorBg03','colorBg04','colorBg05'],
        // bg_color:['blueBg','yeBg','orangeBg','greenBg','redBg'],
        //创建日程、事件...等的起-止时间（Unix时间戳）；在initTask()中初始化；
        task: {},
        week_count: 5,
        line_num: 4,//task行数;
        line_height: 20,//taks行高;
        top_start: 18,//距离grid顶部高度;
        arrow_width: 7,//箭头宽度;
        //请求的数据；
        requestData: {
            start_time: '', //开始时间
            end_time: '',   //结束时间
            month: '',      //月份
            mid: '', //请求人员id；
			type:'' //类型 1 关注人 2 共享人
        },
        //请求的日期范围（起止时间戳）;
        requestRange:[0,0],
        responseData: {},//获取的数据；
        flagMousedown: 0,//0表示没有按下任何鼠标键，1表示按下左键，2表示按下鼠标中键，3表示按下鼠标右键；
        flagSelectDay: false,
        flagSelectTime: false,
        showType: 'month',//显示类型，可以为month、week和day，默认为month；
        $window: $(window),
        $document: $(document),
        $body: $('body'),
        $calendar: $('#Calendar', this.$body),
        $main: $('#CalendarMain', this.$calendar),
        $mainGridOuter: $('#CalendarMainGrid', this.$main),//日历外框架;
        // $mainEditOuter: $('#yyCalendarMainEdit', this.$main),
        // $mainSearchOuter: $('#yyCalendarMainSearch', this.$main),
        $timeColWrapper: null,
        dialog: null,
        monthHtml: '',
        editPanelHtml: '',//日程编辑面板的html代码块；
        setUid: function(){
            var me = this;

            me.uid = intParse($('#yySelfItem').attr('mid'));
        },
        /**
         * 设置自己的id;
         */
        setSelfid: function(id){
            var me = this;

            me.selfid = id ? id : $('#yySelfItem').attr('mid');
        },
        /**
         * 设置用户id，即me.mid;
         * @param {[type]} mid [description]
         */
        setMid: function(mid, type) {
            var me = this;

            mid = intParse(mid || 0);
            me.mid = mid ? mid : 0;
            me.mid = me.mid===me.uid ? 0 : me.mid; // mid和uid相等时，将mid置为0

			me.type = intParse(type); //增加类型 1关注 2共享
        },
        /**
         * 根据type类型，打开相应的日历视图;
         *      分别是month:月视图;
         *            week:周视图;
         *             day:天视图;
         * @param type 可为month、week 和 day;
         */
        openCalendarView: function(type){
            var me = this;
            // 设置showType;
            me.setShowType(type);
            // 显示日历视图;
            me.showView();
            me.getData();//获取数据，然后画出task条（暂时这么处理..）;
            return true;
        },
        /**
         * 根据showType值，显示日历视图;
         */
        showView: function(){
            var me = this,
                showType = me.showType,
                viewType = me.viewType;
                
            showType===viewType[0]
                ? me.showMonth()
                : (showType===viewType[1] ? me.showWeek() : me.showDay());
        },
        /**
         * 需要的一些变量。
         */
        timeSelectValue:{
            endTimePos: 0,
            clientY: 0,
            top: 0,
            numState:0,
            div:null,
            boxState:false,
            weekStartTime:0,//当前周的初始值
            startTime:"",
            endTime:"",
            weekDayNum:""
        },
        /**
         * 通过高度获取时间
         */
        getTime:function (top){
            var helf = Math.floor(top/21);
            var hour = Math.floor(helf/2);
            var min = helf%2==0?"00":"30";
            return hour+":"+min;
        },
        getMillTime:function (hour){
            function getMill(hour){
                var array = hour.split(":");
                return array[0]*60*60 + array[1]*60;
            }
            if(this.showType == 'week'){
                return this.week[0]+this.timeSelectValue.weekDayNum * 24 * 60 *60 + getMill(hour);
            }else{
                return this.day[0]+this.timeSelectValue.weekDayNum * 24 * 60 *60 + getMill(hour);
            }
        },
        /**
         * 时刻选择开始;
         * @param  {[type]} e  [description]
         * @param  {[type]} me [description]
         * @return {[type]}    [description]
         */
        timeSelectStart: function(e, me){
            var timeSelectValue = me.timeSelectValue;
            //删除div
            function cannel(){
                if(timeSelectValue.div!=null){
                    timeSelectValue.div.remove();
                    // var box = $("#timeBox");
                    // box.hide();
                }
            }
            
            var getNum = function (id){
                return id.substring(id.length-1, id.length);
            };
            cannel();
            
            me.flagMousedown = e.which; // 设置按下键状态;
            me.flagSelectTime = true;   // 表示时刻选择开始;
            var $this = me.$timeColWrapper = $(e.target);
            var num = timeSelectValue.weekDayNum = getNum($this.attr("id"));
            $this = $('#yyOver'+num);
            var div = $('#chooseDiv'+num);
            if(!div.length){
                div = $('<div id="chooseDiv'+num+'" class="borderFff alignLeft"></div>');
                $this.append(div);//yy-gutter 
            }
            //求出div的top值;
            var getTop = function(stepHeight){
                var height = e.clientY+$("#yyCalendarWeekBlock").scrollTop()-$("#yyCalendarWeekBlock").offset().top+$(window).scrollTop();
                return height-height%stepHeight+1;
            };
            var top = timeSelectValue.top = getTop(42);
            div.css({   "width": "99.5%",
                        "height":"35px",
                        "background":"#BCD3FC",
                        "left":"0px",
                        "top":top+"px",
                        "z-index":1000,
                        'filter': 'alpha(opacity:50)',
                        "-moz-opacity":0.5,
                        "opacity": 0.5,
                        "text-align":"left",
                        "font-size":"14px",
                        "color":"#1D1D1D",
                        'position':'relative'
                    });
            timeSelectValue.div = div;
            div.html((timeSelectValue.startTime = me.getTime(top))+"-"+(timeSelectValue.endTime=me.getTime(top+57)));
            timeSelectValue.clientY = e.clientY;
            timeSelectValue.endTimePos = (timeSelectValue.endTime === '24:00') ? e.clientY : 0;
            div.on({
                'click': function (){
                    $(this).off().remove();
                    // var box = $("#timeBox");
                    // box.hide();
                    timeSelectValue.div = null;
                }
            });
        },
        /**
         * 时刻选择进行中;
         */
        timeSelectChange: function(e, me){
            var timeSelectValue = me.timeSelectValue;

            if (timeSelectValue.endTime === '24:00' 
                    && timeSelectValue.endTimePos<=e.clientY) {
                return false;
            }
            var div = timeSelectValue.div;
            var numState = timeSelectValue.numState;
            var top = timeSelectValue.top;
            var $weekBlock = $('#yyCalendarWeekBlock');
            var height = e.clientY + $weekBlock.scrollTop()-$weekBlock.offset().top-timeSelectValue.top+$(window).scrollTop();
            var animalTop = top;
            function getHeight(height, top, stepHeight){
                numState = Math.floor(height/stepHeight);
                if(numState<=0){
                    //div.css("top",top-21+"px");
                    animalTop = (top-Math.abs(numState)*stepHeight);
                    if(animalTop<0) return;
                    div.css('top', animalTop+'px');
                    height = Math.abs(numState)*stepHeight+stepHeight-7;
                }else{
                    height = numState*stepHeight+stepHeight-7;
                }
                return height;
            }
            height = getHeight(height, top, 42);
            // if (timeSelectValue.endTime === '24:00' 
            //         && timeSelectValue.clientY<e.clientY) {
            //     return false;
            // }
            // timeSelectValue.clientY = e.clientY;
            div.height(height);
            div.html((timeSelectValue.startTime = me.getTime(animalTop))+'-'+(timeSelectValue.endTime=me.getTime(animalTop+height+17)));
            timeSelectValue.endTimePos = (timeSelectValue.endTime === '24:00' && e.clientY>timeSelectValue.endTimePos) 
                    ? e.clientY 
                    : timeSelectValue.endTimePos;
            timeSelectValue.top = top;
            timeSelectValue.numState = numState;
        },
        /**
         * 时刻选择结束;
         */
        timeSelectEnd: function(e, me){
            var timeSelectValue = me.timeSelectValue,
                Biz = YY.calendarBiz,
                boxState = timeSelectValue.boxState,//content box 操作
                div = timeSelectValue.div;
            me.flagMousedown = 0;       // 重置按下键状态;
            me.flagSelectTime = false;  // 释放时刻选择标识状态;
            timeSelectValue.numStat=0;
            
            me.noSelect(false);// 取消user-select的none设置；
            
            if(!boxState){
                timeSelectValue.boxState = true;
            }
            // 非本人日历，弹出无权限创建提示;
            if (me.mid !== 0) {
                Biz.showNoPermission(e);
            }
            // // 结束时间小于当前时间
            // else if (me.getMillTime(me.timeSelectValue.endTime)*1000<=new Date().getTime()) {
            //     Biz.showErrorRange(e);
            // }
            else {
                var hash_base = me.getHashBase(),
                    hash = hash_base+'&action=add&starttime='+me.getMillTime(me.timeSelectValue.startTime)+'&endtime='+me.getMillTime(me.timeSelectValue.endTime);
                YY.hash.set(hash);
                // me.quickEdit(me.getMillTime(me.timeSelectValue.startTime), me.getMillTime(me.timeSelectValue.endTime)); // 快速添加日程界面;
            }
        },
        dayDateDeal:function (oneDay){
            function isRelase(a,b){
                var a_start_time = formatTime2Num(a.value[6]),
                    a_end_time = formatTime2Num(a.value[7]),
                    b_start_time = formatTime2Num(b.value[6]),
                    b_end_time = formatTime2Num(b.value[7]);
                return (a_end_time<=b_start_time||a_start_time>=b_end_time)?false:true;
            }
            function isChild(parent,child){
                var parent_start_time = formatTime2Num(parent.value[6]),
                    parent_end_time = formatTime2Num(parent.value[7]),
                    child_start_time = formatTime2Num(child.value[6]);
                return parent_start_time<=child_start_time&&parent_end_time>child_start_time;    
            }
            var matrix = [];
            for(var va=0;0<1;va++){
                var tempArr = [];
                for(var i = 0,j = oneDay.length;i<j;i++){
                    if(oneDay[i].isCol>-1)continue;
                    var isIn = true;
                    for(var c = 0,d = tempArr.length; c<d;c++){
                        if(isRelase(tempArr[c],oneDay[i])){
                            isIn = false;
                            break;
                        }
                    }
                    if(isIn){
                        tempArr.push(oneDay[i]);
                        oneDay[i].isCol++;
                        oneDay[i].col = va;                             
                    }
                }
                if(tempArr.length==0)break;
                matrix.push(tempArr);   
            }
            for(var i = 0,j = matrix.length;i<j;i++){
                var positiveArr = matrix[i];
                if(i == matrix.length-1){
                    for(var u = 0,o = positiveArr.length;u<o;u++){
                        positiveArr[u].deep = matrix.length;
                    }
                    continue;
                }
                for(var z = 0,x = positiveArr.length;z<x;z++){
                    var positiveObj = positiveArr[z];
                    for(var a = matrix.length-1; a>=0 ; a--){
                        if(z>a)continue;
                        var againstArr = matrix[a];
                        for(var q = 0,w = againstArr.length;q<w;q++){
                            var againstObj = againstArr[q];
                            var isC = isChild(positiveObj,againstObj);
                            if(isC&&positiveObj.deep<a+1){
                                positiveObj.deep = a+1;
                            }
                            if(z == matrix.length-1)continue;
                            if(isRelase(positiveObj,againstObj)&&positiveObj.next>a+1){
                                positiveObj.next = a+1;
                            }
                        }
                    }
                }
            }
            for(var i = matrix.length-1;i>0;i--){
                var tempA= matrix[i];
                var tempB= matrix[i-1];
                for(var a = tempA.length-1;a>=0;a--){
                    var tempAObj = tempA[a];
                    for(var m = tempB.length-1;m>=0;m--){
                        var tempBObj = tempB[m];
                        if(isRelase(tempAObj,tempBObj)&&tempAObj.deep>tempBObj.deep){
                            tempBObj.deep = tempAObj.deep;
                        }
                    }
                }
            }
            for(var i = 0,j = matrix.length;i<j;i++){
                var tempArray = matrix[i];
                for(var a = 0,b = tempArray.length;a<b;a++){
                    var tempObj = tempArray[a];
                    tempObj.init();
                }
            }
            // for(var a = matrix.length-1; a>=0 ; a--){
                // var againstArr = matrix[a];
                // for(var q = 0,w = againstArr.length;q<w;q++){
                    // var againstObj = againstArr[q];
                    // for(var i = a-1;i>=0;i--){
                        // var positiveArr = matrix[i];
                        // var isBreak = false;
                        // for(var z = 0,x = positiveArr.length;z<x;z++){
                            // var positiveObj = positiveArr[z];
                            // var left = positiveObj.left + 100/positiveObj.deep;
                            // YY.util.trace(againstObj.value[6]+"-"+againstObj.value[7]);
                            // YY.util.trace(isRelase(againstObj,positiveObj));
                            // YY.util.trace(left+"<"+againstObj.left);
                            // if(isRelase(againstObj,positiveObj)&&left < againstObj.left){
                                 // isBreak = true;
                                 // againstObj.left = left;
                            // }
                        // }
                        // if(isBreak)break;
                    // }
                // }
            // }
            return oneDay;
        },
        dealDisplayData:function (weekDay){
            for(var m=0,n=7;m<n;m++){
                var oneDay = weekDay[m];
                weekDay[m] = this.dayDateDeal(oneDay);
            }
            return weekDay;
        },
        /**
         * 过滤指定时间段内的小时日程;
         */
        filterTime:function (startTime, endTime, data){
            var array = [];
            if (data instanceof Array) {
                for(var i=0,j=data.length;i<j;i++){
                    var temp = data[i];
                    if(!temp[14])continue;
                    if(startTime<=temp[2]&&endTime>temp[2])
                        array.push(temp);
                }
            }
            return array;
        },
        ORM:function (temp,m){
            //节点对象构造器v
            var Node = function (temp,m){
                var start_time = formatTime2Num(temp[6]);// 起始时刻
                var end_time = formatTime2Num(temp[7]);// 结束时刻
                this.parent = [];
                this.children = [];
                this.isExhibit = false;
                this.layerNum = 100;
                this.isCol = -1;
                this.next = 0;
                this.isOK = 0;
                this.deep = 1;
                this.col = 0;
                this.value = temp;
                var height = (end_time - start_time)*42-4;
                this.height = height<17 ? 17 : height;
                this.width = 0;
                this.left = 0;
                this.top = start_time*42;
                this.content = "";
                this.dayNum=m;
                this.nextObj = null;
            };
            Node.prototype.show = function (){
                $("#yyCol"+this.dayNum).find(".yy-gutter").append(this.content);
            };
            Node.prototype.doWidth =function (){
                if(this.col+1>this.deep){
                    this.deep = this.col+1;
                }
                if(this.deep-1 == this.col){
                    this.width = 100/this.deep;
                }else{
                    if(this.next == 0){
                        this.width = 100/this.deep*2-15/(this.deep-1);
                    }else{
                        this.width = 100/this.deep*2-15/(this.deep-1) + (this.next -this.col -1)*100/this.deep;
                    }
                }
            };
            Node.prototype.doLeft =function (){
                 if(this.col+1>this.deep){
                    this.deep = this.col+1;
                }
                if(this.col ==0){
                    this.left = 0;
                }else{
                    this.left = 100/this.deep*this.col;
                }
            };
            Node.prototype.bind = function (){
                $("#schedule"+this.value[0]).mouseenter(function (){
                    $(this).toggleClass("borderFff").toggleClass("borderBlue");
                }).mouseleave(function() {
                    $(this).toggleClass("borderFff").toggleClass("borderBlue");
                }); 
                    
            };
            Node.prototype.init = function (){
                this.doLeft();
                this.doWidth();
            };
            
            return new Node(temp,m);
        },
        /**
         * 在周历和日历中添加跨天的task;
         * @param type
         */
        addCrossDayTask: function(type){
            var me = this,
                task = me.task,
                viewType  = me.viewType,
                timeRange = type===viewType[1] ? me.week : me.day,
                line_height = me.line_height,
                allday_height = 0,
                $allday_orig = $('.yy-calendar-allday');

            task.segment_width = $allday_orig.children('.yy-calendar-day-grid').outerWidth();
            me.top_start = 0;
            me.drawCrossDayTask(timeRange[0], timeRange[1], '.yy-calendar-allday',false);
            var $allday_new = $('.yy-calendar-allday');
            $allday_new.find('.yy-calendar-content').each(function(){
                var $last = $(this).children().last(),
                    top = $last.css('top'),
                    height = top ? parseInt(top)+line_height+5 : line_height+5;
                allday_height = allday_height>height ? allday_height : height;
            });
            allday_height && $allday_new.css('height',allday_height+'px');
            me.fixGridHeight(type);//修复周日历的格子高度;
        },
        /**
         * 画出周历;
         */
        drawWeekTask:function (){
            var me = this,
                oneday = me.oneday,
                viewType = me.viewType,
                week = me.week,
                requestData  = me.requestData,  //请求数据（包含请求的起始-终点时间戳）;
                responseData = me.responseData, //获得的响应数据;
                data = responseData[requestData.start_time+'-'+requestData.end_time],
                startTime = week[0],
                endTime   = week[1];
            me.addCrossDayTask(viewType[1]);//添加跨天的task;
            $(".yy-gutter").empty();
            var weekData = me.filterTime(startTime,endTime,data);
            // 对本周数据进行排序 （按开始小时排 或者 高度）
            weekData.sort(function (a,b){
                var a_start_time = formatTime2Num(a[6]),
                    a_end_time = formatTime2Num(a[7]),
                    b_start_time = formatTime2Num(b[6]),
                    b_end_time = formatTime2Num(b[7]);
                var ha = a_end_time-a_start_time;
                var hb = b_end_time-b_start_time;
                return a_start_time==b_start_time ? hb-ha : a_start_time-b_start_time;
            });
            // 获得同一天当中的数据树节点
            var weekDay = [[],[],[],[],[],[],[]];
            //将数据分配到天将其对象化
            for(var i=0,j=weekData.length; i<j; i++){
                var temp = weekData[i];
                for(var m=0,n=7; m<n; m++){
                    if(temp[2]>=startTime+m*oneday && temp[2]<startTime+(m+1)*oneday){
                        weekDay[m].push(this.ORM(temp,m));
                    }
                }
            }
            weekDay = this.dealDisplayData(weekDay);

            for(var m=0,n=7;m<n;m++){
                this.allInit(weekDay[m]);
            }
        },
        allInit:function (array){
            for(var i = 0,j = array.length;i<j;i++){
                var temp = array[i];
                this.render(temp);
                temp.show();
                temp.bind();
            }
        },
        drawDayTask:function (){
            var me = this,
                viewType = me.viewType,
                day = me.day,
                requestData  = me.requestData,  //请求数据（包含请求的起始-终点时间戳）;
                responseData = me.responseData, //获得的响应数据;
                data = responseData[requestData.start_time+'-'+requestData.end_time],
                startTime = day[0],
                endTime   = day[1];
            me.addCrossDayTask(viewType[2]);//添加跨天的task;
            $("div[class=yy-gutter]").empty();
            var dayData = me.filterTime(startTime,endTime,data);
            dayData.sort(function (a,b){
                var a_start_time = formatTime2Num(a[6]),
                    a_end_time = formatTime2Num(a[7]),
                    b_start_time = formatTime2Num(b[6]),
                    b_end_time = formatTime2Num(b[7]);
                var ha = a_end_time-a_start_time;
                var hb = b_end_time-b_start_time;
                return a_start_time==b_start_time ? hb-ha : a_start_time-b_start_time;
            });
            var dayDataObj = [];
            for(var i = 0,j = dayData.length;i<j;i++){
                dayDataObj.push(this.ORM(dayData[i],0));
            }
            dayDataObj = this.dayDateDeal(dayDataObj);
            this.allInit(dayDataObj);
        },
        /**
         * 拼接日和周的时刻日程的显示html;
         * @param object
         */
        render:function (object){
            var me = this,
                bg_color = me.taskcolor,
                str = [],
                isSelf = intParse(me.selfid)===intParse(object.value[5]) ? true : false;
            // 设置颜色;
            if (object.value[9]==25) {
                bg_color = isSelf ? me.taskcolor : me.taskcolor2;
            }
            else {
                bg_color = isSelf ? me.schecolor : me.schecolor2;
            }
            var start_time_str = object.value[6],
                end_time_str = object.value[7];
            str.push('<div title="',start_time_str,'-',end_time_str,' ',object.value[1],'" class="yy-calendar-task borderFff ',bg_color,' alignLeft" feedid="',object.value[11],'" type="',object.value[9],'" fromid="',object.value[8],'" cid="',object.value[0],'" id="schedule',object.value[0],'" style="top:',(object.top+1),'px;left:',(object.left==-1?object.left+"px":object.left+"%"),';width:',object.width,'%; position:absolute;z-index:',(100+object.col),';height:',object.height,'px;">');
            str.push('<dl class="cbrd" style="height:',object.height,'px;">');//<dt>',object.value[6],'点-',object.value[7],'点</dt>'
            str.push('<dd>',object.value[1],'</dd></dl></div>');//(object.height-10)//<div class="',bg_color,'" style="height:10px;" ></div>
            object.content = str.join("");
        },
        /**
         * 分别表示cover所能覆盖范围的，左上角横纵(x,y)坐标，右下角横纵(x,y)坐标；
         */
        coverRange:[[0,0],[0,0]],
        /**
         * 设置coverRange;
         */
        setCoverRange: function(){
            var me = this;
            if (me.showType === 'month') {
                var task = me.task,
                    $monthGrid = $('#yyCalendarMonthGrid', me.$yyCalendarMain),
                    offset = $monthGrid.offset(),
                    width  = $monthGrid.outerWidth(),
                    height = $monthGrid.outerHeight(),
                    coverRange = me.coverRange;
                coverRange[0][0] = offset.left;
                coverRange[0][1] = offset.top;
                coverRange[1][0] = coverRange[0][0]+width;
                coverRange[1][1] = coverRange[0][1]+height;

                task.segment_width_average  = width/7;
                task.segment_height_average = height/me.week_count;
            }
            else {
                var $dayGrid = $('.yy-calendar-day-grid'),
                    first_offset = $dayGrid.first().offset(),
                    last_offset  = $dayGrid.last().offset(),
                    task = me.task,
                    coverRange = me.coverRange;
                coverRange[0][0] = first_offset.left;
                coverRange[0][1] = first_offset.top;
                coverRange[1][0] = last_offset.left+task.segment_width;
                coverRange[1][1] = last_offset.top+task.segment_height;
            }
        },
        /**
         * 开始选择时间和日期，准备创建日程或者事件；
         */
        selectStart: function(e, me){
            //设置按下键状态；
            me.flagMousedown = e.which;
            me.flagSelectDay = true;

            var $target = $(e.target).closest('.yy-calendar-day-grid'),
                timestamp = parseInt($target.attr('timestamp')),
                offset = $target.offset(),
                    left= offset.left, //Math.floor(offset.left)
                    top = offset.top,  // Math.floor(offset.top)
                pagex = e.pageX,
                pagey = e.pageY,
                width  = $target.outerWidth(), //$target.width()
                height = $target.outerHeight(),//$target.height()
                task = me.task,
                coverStr = '';

            task.$start = task.$end = $target;//设置起始位置块；
            task.segment_width  = width;
            task.segment_height = height;
            task.start_time = timestamp;
            task.end_time = timestamp+task.segment_time;
            task.start_left = left;
            task.start_top  = top;
            task.end_left = left;
            task.end_top  = top;
            task.start_x = pagex;
            task.start_y = pagey;
            task.end_x = pagex;
            task.end_y = pagey;

            me.setCoverRange();
            coverStr = '<div class="yy-calendar-cover-container" style="z-index:10;display:block;">'
                + '<div style="left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;" '
                + 'class="yy-calendar-cover">&nbsp;</div></div>';
            me.$body.append(coverStr);
            me.$coverContainer = $('.yy-calendar-cover-container', me.$body);
        },
        /**
         * 移动鼠标，即时更新选择的日期块；
         */
        selectChange: function(e, me){
            var pagex = e.pageX,
                pagey = e.pageY;
            // 在$mainGrid内，按下左键然后移动ing...；
            // if(me.flagMousedown===1&&me.isInMainGrid(pagex,pagey)) {
                var $coverContainer = me.$coverContainer,
                    $cover = null,
                    coverRange = me.coverRange,
                    gridstart_x = coverRange[0][0],
                    gridstart_y = coverRange[0][1],
                    // gridend_x = coverRange[1][0],
                    // gridend_y = coverRange[1][1],
                    task = me.task,
                        grid_height = me.showType === 'month' ? task.segment_height_average : task.segment_height,
                        grid_width  = me.showType === 'month' ? task.segment_width_average : task.segment_width,
                        start_left = task.start_left,
                        start_top  = task.start_top,
                    end_left = Math.floor((pagex-gridstart_x)/grid_width)*grid_width+gridstart_x,
                    end_top  = Math.floor((pagey-gridstart_y)/grid_height)*grid_height+gridstart_y;
                    // alert(task.segment_height_average)
                    // alert(task.segment_height)
                task.end_x = pagex;
                task.end_y = pagey;
                task.end_left = end_left;
                task.end_top  = end_top;
                
                var x = end_left - start_left,
                    y = end_top - start_top,
                    divsion = Math.abs(y)/grid_height,
                    divsion_ceil = Math.ceil(divsion),
                    lineNum = divsion_ceil-divsion>0.95 ? divsion_ceil : divsion_ceil+1,//经修复后的行数；
                    // 位置标识符，1为起始行之下，0为起始行，-1为起始行之上；
                    // 10为当起始位置在同一行，而end_top 和 start_top不相等的误差值;
                    posFlag = Math.abs(y)>10 ? (y>0 ? 1 : -1) : 0,
                    temp_str = [];
                for(var i=0; i < lineNum; i++){
                    temp_str[i] = '<div style="height:'+grid_height+'px;" class="yy-calendar-cover">&nbsp;</div>';
                }
                temp_str = temp_str.join('');
                
                // $coverContainer.html(temp_str);
                $cover = $(temp_str);
                var cover_startTop  = posFlag>0 ? start_top : end_top,
                    cover_startLeft = posFlag>0 
                        ? start_left 
                        : (posFlag===0 
                            ? (x>0 ? start_left : end_left)
                            : end_left),
                    cover_startDivision = (coverRange[1][0]-cover_startLeft)/grid_width,//计算后存在误差的单元格数；
                    cover_startDivision_floor = Math.floor(cover_startDivision),//经过floor计算后的单元格数；
                    cover_startWidth = lineNum>1 
                        ? ((cover_startDivision-cover_startDivision_floor)>0.95 //原始值与舍去后的单元格数差为0.95以上（误差在0.05以内）；
                                ? (cover_startDivision_floor+1)*grid_width 
                                : cover_startDivision_floor*grid_width)
                        : grid_width+(Math.abs(end_left-start_left)),
                    cover_endWidth = posFlag>0 ? (end_left-gridstart_x+grid_width) : (start_left-gridstart_x+grid_width);
                $cover.each(function(i){
                    var top = cover_startTop+grid_height*i,
                        left = i ? gridstart_x : cover_startLeft,
                        width = i ? (i===(lineNum-1) ? cover_endWidth : grid_width*7)
                                  : cover_startWidth;
                    $(this).css({'left': left,'top': top,'width': width});
                });

                $coverContainer.children('.yy-calendar-cover').replaceWith($cover);
            // }
        },
        selectEnd: function(e, me){
            var selectTime = me.getSelectTime(),//获取选择的起止Unix时间戳;
                Biz = YY.calendarBiz;
            //selectTime[1] = selectTime[1] - me.oneday;
            if (me.mid !== 0) {
                Biz.showNoPermission(e);
            }
            // // 结束时间小于当前时间
            // else if (selectTime[1]<=me.today.timestamp) {
            //     Biz.showErrorRange(e);
            // }
            else {
                var hash_base = me.getHashBase(),
                    hash = hash_base+'&action=add&starttime='+selectTime[0]+'&endtime='+selectTime[1];
                YY.hash.set(hash);
                // me.quickEdit(selectTime[0], selectTime[1]);
            }
            
            //重置按下键状态；
            me.flagMousedown = 0;
            me.flagSelectDay = false;
            //取消user-select的none设置；
            me.noSelect(false);
        },
        /**
         * 判断选择结束的时候，是大于还是小于开始日期；
         */
        endThanStart: function(){
            var me = this,
                task = me.task,
                x = task.end_left-task.start_left,
                y = task.end_top-task.start_top,
                x_gridNum = Math.round(x/task.segment_width),
                y_gridNum = Math.round(y/task.segment_height),
                flag = y_gridNum>0 ? 1 
                        : (y_gridNum<0 ? -1 
                                : (x_gridNum>0 ? 1 : (x_gridNum<0 ? -1 : 0)));
            return flag;
        },
        /**
         * 获取选择的起止Unix时间戳，返回一个数组，保存着起止时间；
         */
        getSelectTime: function(){
            var me = this,
                $cover = $('.yy-calendar-cover', me.$body),
                task = me.task,
                    segment_width = task.segment_width,
                    segment_time = task.segment_time,
                    start_time = task.start_time,
                end_time = 0, allWidth = 0;
            $cover.each(function(i){
                allWidth = allWidth + $(this).width();
            });
            var timeRange = Math.round(allWidth/segment_width)*segment_time;
            if(me.endThanStart()>=0){//当天结束，或者延续到之后的天数；
                end_time = start_time+timeRange;
            }
            else {
                start_time = start_time-timeRange+segment_time;
                end_time = task.start_time+segment_time;
            }
            // YY.util.trace(new Date(start_time*1000).toLocaleString());
            // YY.util.trace(new Date(end_time*1000).toLocaleString());
            return [start_time,end_time];
        },
        drawTask: function(){
            var me = this;
            switch(me.showType){
                case 'month':
                    var fixdate = me.fixed_date,
                        start = fixdate[0],
                        end   = fixdate[1];
                    me.top_start = 18;
                    me.drawCrossDayTask(start, end, '#yyCalendarMonthGrid');
                break;
                case 'week':
                    me.drawWeekTask();
                break;
                case 'day':
                    me.drawDayTask();
                break;
            }
            // Biz.backCalendar();
        },
        /**
         * 获取初始化的数据;
         */
        getInitData: function(){
            var me = this,
                requestData  = me.requestData;  //请求数据（包含请求的起始-终点时间戳）;
            // YY.util.trace(requestData);
            // YY.util.trace(new Date(requestData.start_time*1000).toLocaleString());
            // YY.util.trace(new Date(requestData.end_time*1000).toLocaleString());
            // YY.util.trace(me.showType);
            me.getAjaxData(requestData,function(){
                me.drawTask();
            });
        },
        /**
         * 获取一个时间段的日程数据;
         */
        getData: function(){
            var me = this,
                args = arguments,
                oneweek = me.oneweek,
                timeblock = me.timeblock,
                requestRange = me.requestRange, //已经请求过数据的日期范围;
                requestData  = me.requestData,  //请求数据（包含请求的起始-终点时间戳）;
                mid = requestData.mid,
				type = requestData.type,

				start = 0, end = 0;
            switch(me.showType){
                case 'month':
                    var fixdate = me.fixed_date;
                    start = fixdate[0];
                    end   = fixdate[1];
                    me.top_start = 18;
                break;
                case 'week':
                    var week = me.week;
                    start = week[0];
                    end   = week[1];
                    me.top_start = 0;
                break;
                case 'day':
                    var day = me.day;
                    start = day[0];
                    end   = day[1];
                    me.top_start = 0;
                break;
            }
            if(start>=requestRange[0]&&end<=requestRange[1]){//请求日历的起止时间在requestRange范围内;
                me.drawTask();
                start = start - timeblock;
                end   = end + timeblock;
                if(start<requestRange[0]){
                    requestRange[0] = requestRange[0]-timeblock;
                    var requestData1 = {
                            start_time: requestRange[0],
                            end_time:   requestRange[0]+timeblock,
                            month: requestData.month,
                            mid: mid,
							type:type
                    };
                    me.getAjaxData(requestData1);
                }
                if(end>requestRange[1]){
                    requestRange[1] = requestRange[1]+timeblock;
                    var requestData2 = {
                            start_time: requestRange[1]-timeblock,
                            end_time:   requestRange[1],
                            month: requestData.month,
                            mid: mid,
							type:type
                    };
                    me.getAjaxData(requestData2);
                }
            }
            else{
                var max_deep = 20,
                    request_start = requestRange[0],
                    request_end   = requestRange[1],
                    inmax_flag = false,
                    requestData3 = null;
                if(start<requestRange[0]){
                    for(var i=0;i<max_deep;i++){
                        request_start -= timeblock;
                        if(start>=request_start){
                            requestRange[0] = request_start;
                            requestData3 = {
                                start_time: request_start,
                                end_time  : request_start+timeblock,
                                month: requestData.month,
                                mid: mid,
								type:type
                            };
                            me.getAjaxData(requestData3,function(){
                                if(i===0){
                                    args.callee.apply(me);
                                    return;
                                }
                                for(;i>0;i--){
                                    requestData3.start_time = requestData3.end_time;
                                    requestData3.end_time += timeblock;
                                    if(requestData3.start_time<end){
                                        me.getAjaxData(requestData3,function(){
                                            args.callee.apply(me);
                                        });
                                    }
                                    else {
                                        me.getAjaxData(requestData3);
                                    }
                                }
                            });
                            inmax_flag = true;
                            break;
                        }
                    }
                }
                else if(end>requestRange[1]){
                    for(var i=0;i<max_deep;i++){
                        request_end += timeblock;
                        if(end<=request_end){
                            requestRange[1] = request_end;
                            requestData3 = {
                                start_time: request_end-timeblock,
                                end_time  : request_end,
                                month: requestData.month,
                                mid: mid,
								type:type
                            };
                            me.getAjaxData(requestData3,function(){
                                if(i===0){
                                    args.callee.apply(me);
                                    return;
                                }
                                for(;i>0;i--){
                                    requestData3.end_time = requestData3.start_time;
                                    requestData3.start_time -= timeblock;
                                    if(requestData3.end_time>start){
                                        me.getAjaxData(requestData3,function(){
                                            args.callee.apply(me);
                                        });
                                    }
                                    else {
                                        me.getAjaxData(requestData3);
                                    }
                                }
                            });
                            inmax_flag = true;
                            break;
                        }
                    }
                }
                if(!inmax_flag){//如果ajax请求数在max_deep范围以外;
                    me.responseData = {};
                    var month = me.month,
                        fix_time = me.fixMonthDate(month[0], month[1]);
                    fix_time[0] = fix_time[0] - timeblock;
                    fix_time[1] = fix_time[1] + timeblock;
                    //重新设置初始化请求数据;根据当前的月份时间，设置请求数据的起止时间;
                    me.setRequestData(fix_time[0], fix_time[1]);
                    //重置请求范围;
                    requestRange[0] = fix_time[0];
                    requestRange[1] = fix_time[1];
                    me.getInitData();
                }
            }
        },
        /**
         * 异步获取请求数据;
         * @param requestData
         * @param func
         */
        getAjaxData: function(requestData, func){
            var me = this,
                start = requestData.start_time,
                end   = requestData.end_time,
                dataURI = me.dataURI;
            util.ajaxApi(dataURI, function(d, s){
                var taskDatas = d.data;
                //按照task持续时间长短、是否全天、非全天时间段按持续时间长短、创建晚早顺序排序；
                taskDatas.sort(function(a,b){
                    return me.sortTaskData(a, b);
                });
                me.responseData[start+'-'+end] = taskDatas;
                typeof func === 'function' && func();
            },'POST', 'json', requestData);
        },
        /**
         * 对传进来的两个task对象，进行比较，返回-1，0，1进行排序；
         * @param a
         * @param b
         */
        sortTaskData: function(a,b){
            var sd = a[2] - b[2],//起始日期比较；
                c  = b[13] - a[13],//持续时间比较；
                st = formatTime2Num(a[6]) - formatTime2Num(b[6]),//起始时刻比较；
                et = formatTime2Num(b[7]) - formatTime2Num(a[7]),//结束时刻比较；
                cr = a[10] - b[10];//创建时间比较；
            return sd!==0 ? sd
                    : (c!==0 ? c : (!b[14]&&a[14] ? 1 //同一天，b是全天，a是时间段的比较；
                            : (b[14]&&a[14] ? (st!==0 ? st : (et!==0 ? et : cr)) //同一天，a和b均是时间段；
                                    : cr)));
        },
        /**
         * 修复月日历的格子高度;
         * @param  {[type]} type 当前日历的展示模式（month、week、day）
         * @return {[type]}      [description]
         */
        fixGridHeight: function(type){
            var me = this,
                viewType = me.viewType,
                main_height = me.getMainHeight(),
                $mainGridOuter = me.$mainGridOuter;
            if($mainGridOuter.is(':hidden')){
                $mainGridOuter.css('visibility','hidden').show();
            }

            var $main_header = $('.yy-calendar-main-header', $mainGridOuter),
                main_header_height = $main_header.outerHeight(true);
            me.$main.height(main_height);
            //me.$mainEditOuter.height(main_height);
            type===viewType[0] 
                ? me.$mainGridOuter.children('#yyCalendarMonthGrid').height(main_height-main_header_height-2)
                : ((type===viewType[1]||type===viewType[2]) 
                            ? me.$mainGridOuter.children('#yyCalendarWeekBlock').height(main_height-main_header_height-3) : '');
        },
        /**
         * 获取日历主体table的高度;
         */
        getGridHeight: function(){
            var me = this,
                main_height = me.getMainHeight(),
                main_header_height = $('.yy-calendar-main-header',me.$mainGridOuter).height();
            me.$main.height(main_height);
            me.$mainGridOuter.height(main_height);
            // me.$mainEditOuter.height(main_height);
            
            return (main_height-main_header_height-2);
        },
        /**
         * 获取大日历主面板高度;
         *      如果在当前窗体中，原始main的高度小于500，那么将其最小设置为500；
         */
        getMainHeight: function(){
            var me = this,
                window_height = $(window).height(),
                main_offset_top = me.$main.offset().top,
                main_height = window_height-main_offset_top;

            main_height = main_height < 350 ? 350 : main_height;//-14;

            // var main_height = 740;
            return main_height;
        },
        /**
         * 设置初始化请求数据；
         *      初始化请求日期为，当前月份的（前一个月-后一个月）;
         */
        initRequestData: function(){
            var me = this,
                timeblock = me.timeblock,
                oneweek = me.oneweek,
                month = me.month,
                now_month = me.today.month,
                fix_time = me.fixMonthDate(month[0], month[1]),
                requestRange = me.requestRange;
            fix_time[0] = fix_time[0] - timeblock;
            fix_time[1] = fix_time[1] + timeblock;

            // 设置初始化请求数据;根据当前的月份时间，设置请求数据的起止时间;
            me.setRequestData(fix_time[0], fix_time[1], now_month);
            requestRange[0] = fix_time[0];
            requestRange[1] = fix_time[1];
            // YY.util.trace(new Date(me.requestData.start_time*1000).toLocaleString());
            // YY.util.trace(new Date(me.requestData.end_time*1000).toLocaleString());
            // YY.util.trace(new Date(requestRange[0]*1000).toLocaleString());
            // YY.util.trace(new Date(requestRange[1]*1000).toLocaleString());
        },
        /**
         * 设置请求数据；
         */
        setRequestData: function(start_time,end_time,month){
            var me = this,
                requestData = me.requestData;
            start_time = start_time ? start_time : requestData.start_time;
            end_time   = end_time ? end_time : requestData.end_time;
            
            requestData.start_time = start_time;//开始时间
            requestData.end_time   = end_time;//结束时间
            requestData.month      = month ? month : requestData.month;//月份
            requestData.mid        = me.mid;//开始时间
			requestData.type        = me.type;//类型
        },
        /**
         * 初始化当前的日历日期;
         */
        initDate: function(timestamp){
            var me = this,
                date = YY.date;

            me.today = date.getToday();

            timestamp = timestamp || me.today.timestamp;
            // 设置初始化日期段(包括 大日历的月、周，小日历的月、周);
            me.setDay(timestamp);
        },
        /**
         * 根据一天的起始时间，设置天的起止时间;
         *      设置了day,则同时也设置了week、month;
         * @param day_start
         */
        setDay: function(day_start){
            var me = this,
                oneday = me.oneday,
                day = me.day;
            day[0] = day_start ? parseInt(day_start) : day[0];
            day[1] = day[0] + oneday;
            me.setWeek(day[0]);
            me.setMonth(day[0]);
        },
        /**
         * 根据起始时间，设置周的起止时间;
         * @param a_day_timestamp
         */
        setWeek: function(a_day_timestamp){
            var me = this,
                the_week = 0,
                oneday  = me.oneday,
                oneweek = me.oneweek,
                week = me.week;
            if(a_day_timestamp<week[0] || a_day_timestamp>=week[1]){
                dateObj = me.getDateObj(a_day_timestamp);
                the_week = dateObj.getDay();
                the_week = the_week ? the_week : 7;
                
                week[0] = a_day_timestamp - (the_week - 1)*oneday;
                week[1] = week[0] + oneweek;
            }
        },
        /**
         * 根据任意一个时间，设置包含传入时间的月份的，月历的起-止时间戳;
         *      规则为：月份的起止点要包括传入的时间戳;
         *      设置大日历日期的同时需要设置小日历的起止时间;
         * @param a_day_timestamp
         */
        setMonth: function(a_day_timestamp){
            var me = this,
                month = me.month,
                dateObj, the_year, the_month;
            if(a_day_timestamp<month[0] || a_day_timestamp>=month[1]){
                dateObj = me.getDateObj(a_day_timestamp);
                the_year  = dateObj.getFullYear();
                the_month = dateObj.getMonth()+1;//实际月份;
                
                month[0] = Date.parse(the_month + '/1/' + the_year)/1000;
                month[1] = (the_month === 12 
                                ? Date.parse('1/1/' + (the_year+1)) 
                                : Date.parse((the_month+1) + '/1/' + the_year))/1000;
                me.fixed_date = me.fixMonthDate(month[0], month[1]);
            }
            //设置小日历的起止时间;
            me.setMiniDate(month[0]);
        },
        /**
         * 设置小日历的起止时间;
         */
        setMiniDate: function(a_day_timestamp){
            var me = this,
                mini_date = me.mini_date,
                dateObj, the_year, the_month;
            if(a_day_timestamp<mini_date[0] || a_day_timestamp>=mini_date[1]){
                dateObj = me.getDateObj(a_day_timestamp);
                the_year  = dateObj.getFullYear();
                the_month = dateObj.getMonth()+1;//实际月份;
                
                mini_date[0] = Date.parse(the_month + '/1/' + the_year)/1000;
                mini_date[1] = (the_month === 12
                                    ? Date.parse('1/1/' + (the_year+1))
                                    : Date.parse((the_month+1) + '/1/' + the_year))/1000;
            }
        },
        /**
         * 下个月；
         */
        nextMonth: function(){
            var me = this;
            me.setMonth(me.month[1]);//将me.month设置为下个月;
            me.showMonth();
        },
        /**
         * 根据当前显示月历，获取上个月的月历；
         */
        prevMonth: function(){
            var me = this;
            me.setMonth(me.month[0]-me.oneday);//将me.month设置为上个月;
            me.showMonth();
        },
        /**
         * 展示出当前me.month中所指月的月历;
         */
        showMonth: function(){
            var me = this,
                today = me.today,
                day   = me.day,
                month = me.month,
                fixed = me.fixed_date,
                monthDateArr = me.getMonthDateArr(month[0],month[1],fixed[0],fixed[1]),
                    dateArr   = monthDateArr[0], 
                    the_month = monthDateArr[1], 
                    the_year  = monthDateArr[2];
            // 根据day的起始时间位置，重置week和day的起止时间;
            if(day[0]>=month[1] || day[0]<month[0]){
                var timestamp = me.hasToday(month[0], month[1]) 
                        ? today.timestamp //如果月起止时间中包含今天;
                        : Date.parse(the_month+'/1/'+the_year)/1000;
                me.setDay(timestamp);
            }
            // 获取当前月的周数;
            me.week_count = parseInt(dateArr.length/7);
            // YY.util.trace(new Date(month[0]*1000).toLocaleString());
            // YY.util.trace(new Date(month[1]*1000).toLocaleString());
            var monthHtml = me.drawBigMonth(dateArr, the_month, the_year);
            me.$mainGridOuter.html(monthHtml);
            // 修复月日历的格子高度;
            me.fixGridHeight('month');
            me.fixTask();
            
            var miniMonth_str = me.drawMiniMonth(dateArr, the_month, the_year);
            $('#yyMiniCalendar').html(miniMonth_str);
            $('#yyCalendarDate').html(me.formatDate(month[0], 4)[0]);
        },
        /**
         * 小日历，明年;
         * @returns {Boolean}
         */
        nextMiniYear: function(){
            var me = this,
                nextYearTime = me.getNextDateTime(me.mini_date[0],'year');
            me.setMiniDate(nextYearTime);
            me.showMiniMonth();
            return true;
        },
        /**
         * 小日历，前一年;
         * @returns {Boolean}
         */
        prevMiniYear: function(){
            var me = this,
                prevYearTime = me.getPrevDateTime(me.mini_date[0],'year');
            me.setMiniDate(prevYearTime);
            me.showMiniMonth();
            return true;
        },
        /**
         * 小月历，下个月;
         */
        nextMiniMonth: function(){
            var me = this;
            me.setMiniDate(me.mini_date[1]);
            me.showMiniMonth();
            return true;
        },
        /**
         * 小月历，上个月..
         */
        prevMiniMonth: function(){
            var me = this;
            me.setMiniDate(me.mini_date[0]-me.oneday);
            me.showMiniMonth();
            return true;
        },
        /**
         * 根据小日历的mini_date记录的月份，显示小月历;
         * @returns {Boolean}
         */
        showMiniMonth: function(){
            var me = this,
                mini_date  = me.mini_date,
                mini_fixed = me.fixMonthDate(mini_date[0],mini_date[1]),
                monthDateArr = me.getMonthDateArr(mini_date[0],mini_date[1],mini_fixed[0],mini_fixed[1]);
                    dateArr = monthDateArr[0], 
                    the_month = monthDateArr[1], 
                    the_year  = monthDateArr[2];
            var miniMonth_str = me.drawMiniMonth(dateArr, the_month, the_year);
            $('#yyMiniCalendar').html(miniMonth_str);
            return true;
        },
        /**
         * 根据传入的月份的起止时间，以及相应的月份修复起止时间，来获取对应的日历数组;
         * @param start
         * @param end
         * @param fixed_start
         * @param fixed_end
         * @returns {Array} [dateArr, the_month, the_year],分别是天数、月、年;
         */
        getMonthDateArr: function(start,end,fixed_start,fixed_end){
            if(!start || !end) return false;
            fixed_start = fixed_start || start;
            fixed_end   = fixed_end || end;
            var me = this,
                oneday = me.oneday,
                startObj = me.getDateObj(start),
                startObj_week_orig = startObj.getDay(),
                startObj_week = startObj_week_orig ? startObj_week_orig : 7,
                endObj   = me.getDateObj(end-oneday),
                endObj_week_orig = endObj.getDay(),
                endObj_week = endObj_week_orig ? endObj_week_orig : 7,
                endObj_day  = endObj.getDate(),
                beforeDayNum = start===fixed_start ? 0 : (startObj_week-1), 
                afterDayNum  = end===fixed_end ? 0 : (7-endObj_week), //当前日历中，前后补充的天数;
                dateArr = [],
                the_year  = startObj.getFullYear(),//当前日历的年份;
                the_month = startObj.getMonth()+1;//当前日历的月份;
            if(beforeDayNum){//需要补充上个月的日期;
                var fixedStartObj = me.getDateObj(fixed_start),
                    fixedStartObj_day = fixedStartObj.getDate();
                for(; beforeDayNum>0; beforeDayNum--){ //上个月补充日期;
                    dateArr.push(- fixedStartObj_day++); 
                }
            }
            for(var i=1; i<=endObj_day; i++){ dateArr.push(i); }//当月日期;
            if(afterDayNum){//需要补充下个月的日期;
                for(var j=1; j<=afterDayNum; j++){ //下个月补充日期;
                    dateArr.push(- j); 
                }
            }
            return [dateArr, the_month, the_year];
        },
        /**
         * 画出大日历；
         */
        drawBigMonth: function(dateArr, the_month, the_year){
            dateArr = dateArr || [];
            var me = this,
                prev_month = the_month - 1,
                next_month = the_month + 1,
                prev_month_year = the_year,
                next_month_year = the_year,
                month = me.month,
                today_day  = me.today.day, 
                today_flag = me.hasToday(month[0], month[1]),
                k = 0, t = 0, t_abs = 0, tstamp = 0, str_arr = [];
            if (prev_month === 0 ) {
                prev_month = 12;
                prev_month_year -= 1;
            }
            if (next_month === 13) {
                next_month = 1;
                next_month_year += 1;
            }
            str_arr.push('<table width="100%" border="0" cellspacing="0" cellpadding="0" class="yy-calendar-main-header yueliTable yue_rili_title"><tbody><tr><th class="header">周一</th><th class="header">周二</th><th class="header">周三</th><th class="header">周四</th><th class="header">周五</th><th class="header">周六</th><th class="header">周日</th></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" class="yueliTable" id="yyCalendarMonthGrid"><tbody>');

            for(var i=0,len=dateArr.length; i<len; i++){
                k = (k===7) ? 0 : k; 
                t = dateArr[i];
                t_abs = Math.abs(t);
                tstamp = (t>0 
                            ? Date.parse(the_month+'/'+t_abs+'/'+the_year) 
                            :((t<0&&t_abs>20) 
                                ? Date.parse(prev_month+'/'+t_abs+'/'+prev_month_year)
                                : Date.parse(next_month+'/'+t_abs+'/'+next_month_year)))/1000;
                str_arr.push((k===0?'<tr>':''),'<td class="yy-calendar-day-grid ',(t>0?'yy-calendar-valid':'yy-calendar-invalid'),
                                (today_flag&&today_day===t?' yy-calendar-today':''),'" timestamp="',tstamp,'" week="',(k+1),
                                '" day="',t_abs,'"><div class="yy-calendar-content relative',
                                (k===0 ? ' yy-calendar-row-first' : (k===6 ? ' yy-calendar-row-last' : '')),
                                '"><p class="',(t>0 ? 'title' : 'title_sy'),'">',t_abs,'</p></div></td>',(k===6 ? '</tr>' : ''));
                k++;
            }
            str_arr.push('</tbody></table>');
            return str_arr.join('');
        },
        /**
         * 画出小日历；
         */
        drawMiniMonth: function(dateArr, the_month, the_year){
            var me = this,
                prev_month = the_month - 1,
                next_month = the_month + 1,
                prev_month_year = the_year,
                next_month_year = the_year,
                showType = me.showType,
                mini_date = me.mini_date,
                month = me.month,
                week  = me.week,
                day   = me.day,
                i = 0, ex_i = 0, k = 0, t = 0, t_abs = 0, str_arr = [], str = '',bg_str = '',
                len = dateArr.length, dateArr_last = dateArr[len-1], 
                today_flag = me.hasToday(mini_date[0], mini_date[1]), 
                today_day  = me.today.day, 
                today_pos  = $.inArray(today_day, dateArr),
                minieqbig = !!(mini_date[0]===month[0]);
            if (prev_month === 0) {
                prev_month = 12;
                prev_month_year -= 1;
            }
            if (next_month === 13) {
                next_month = 1;
                next_month_year += 1;
            }
            str = '<div class="riliSmall2"><header class="clearfix today">'
                +'<p class="fl year alignCenter"><a class="icoLeft yy-prev-year" href="#"></a>'
                +'<span>'+the_year+'</span><a class="icoRt yy-next-year" href="#"></a></p>'
                +'<p class="fl day alignCenter"><a class="icoLeft yy-prev-month" href="#"></a>'
                +'<span>'+the_month+'</span><a class="icoRt yy-next-month" href="#"></a></p>'
                +'</header><table width="170"><thead><tr><td>一</td><td>二</td>'
                +'<td>三</td><td>四</td><td>五</td><td>六</td><td>日</td></tr></thead><tbody>';
            for(; i<len; i++){
                k = (k===7) ? 0 : k; 
                t = dateArr[i];
                t_abs = Math.abs(t);
                tstamp = (t>0 
                            ? Date.parse(the_month+'/'+t_abs+'/'+the_year) 
                            :((t<0&&t_abs>20) 
                                ? Date.parse(prev_month+'/'+t_abs+'/'+prev_month_year)
                                : Date.parse(next_month+'/'+t_abs+'/'+next_month_year)))/1000;
                bg_str = minieqbig&&(showType==='month'
                    ||(showType==='week'&&tstamp>=week[0]&&tstamp<week[1])
                    ||(showType==='day'&&tstamp===day[0]))?'blueBg ':'';
                bd_str = today_flag?(today_pos<7?(i===(today_pos-1)?'blueBor-right ':'')
                            :(i===(today_pos-1)&&today_pos%7?'blueBor-right '
                                    :(i===(today_pos-7)?'blueBor-bottom ':''))):'';
                str_arr[i] = (k===0?'<tr>':'')+'<td type="mini" pos="'+i+'" class="'+bg_str+(t>0?'':'c6 ')
                    + bd_str + (today_flag&&today_day===t?' blueBor">':' ">')
                    + t_abs+'</td>'+(k===6?'</tr>':'');
                k++;
            }
            if(len<42){
                dateArr_last = dateArr_last>10?1:Math.abs(dateArr_last)+1;
                for(; ; ex_i++){
                    if(ex_i===7) break;
                    str_arr[len+ex_i] = (ex_i===0?'<tr>':'')+'<td class="c6" pos="'+(len+ex_i)+'" type="mini">'+(dateArr_last+ex_i)+'</td>'+(ex_i===6?'</tr>':'');
                }
            }
            return str+str_arr.join('')+'</tbody></table></div>';
        },
        /**
         * 点击小日历，实现日历的切换;
         * @param $day
         * @returns {Boolean}
         */
        clickMini:function ($day){
            var me = this,
                actived_class = 'blueBg',
                gray_class = 'c6',
                showType = me.showType,
                oneday = me.oneday,
                mini_date = me.mini_date, 
                pos = parseInt($day.attr('pos')),
                day = parseInt($day.html()),
                //被激活天的Unix时间戳;
                actived_day = (!$day.hasClass(gray_class) //点击当月;
                    ? mini_date[0] 
                    : (($day.hasClass(gray_class) && pos<7) //点击上个月;
                            ? me.getPrevDateTime(mini_date[0], 'month')
                            : mini_date[1])) + (day-1)*oneday,//否则是下个月;
                flag = showType==='day'&&$day.hasClass(actived_class)?true:false;
            if(flag) return true;
            me.setDay(actived_day);
            me.showType = showType==='month'
                ?($day.hasClass(actived_class)?'week':showType)
                :(showType==='week'
                        ? ($day.hasClass(actived_class)?'day':showType)
                        : 'day');
            showType = me.showType;
            me.activeMode($('#'+showType+'Calendar'));
            me.openCalendarView(showType);//根据showType的值，切换为相应的日历视图；
            return true;
        },
        /**
         * 画出月历的html;
         * @param dateArr 表示日历数据;
         * @param the_month 表示主月历的月份;
         * @param the_year 表示月历的年份;
         * @param type 表示绘制的不同类型html代码的月历样式;
         * 
         * Note：此函数暂时没用..
         */
        drawMonthCalendar: function(dateArr, the_month, the_year, type){
            var me = this,
                str = '';
            type = type || 1;
            switch(type){
                case 1:
                    str = me.drawBigMonth(dateArr, the_month, the_year);//大月历;
                break;
                case 2:
                    str = me.drawMiniMonth(dateArr, the_month, the_year);//小月历;
                break;
            }
            return str;
        },
        /**
         * 判断日期段是否包含今天;
         * @param start_time 起始时间;
         * @param end_time 结束时间;
         */
        hasToday: function(start_time, end_time){
            var me = this,
                today_timestamp = me.getTimestamp();
            return !!(today_timestamp>=start_time&&today_timestamp<end_time);
        },
        /**
         * 根据日期对象，获取Unix时间戳；
         * @param DateObj不为空的时候，获取指定日期对象的Unix时间戳，否则获取当天(凌晨)的Unix时间戳；
         *      若此方法获取三个参数，那么将分别把其当作year,month,day;
         */
        getTimestamp: function(DateObj){
            var year, month, day;
            if(typeof DateObj === 'object' || typeof DateObj === 'undefined'){
                DateObj = DateObj || new Date();
                year  = DateObj.getFullYear(),
                month = DateObj.getMonth()+1,
                day   = DateObj.getDate();
            }
            else {
                year  = DateObj;
                month = arguments[1];
                day   = arguments[2];
            }
            return Date.parse(month+'/'+day+'/'+year)/1000;
        },
        /**
         * 获取指定Unix时间戳的日期对象；
         * @param timestamp不为空的时候，获取指定Unix时间戳的日期对象，否则获取当前的日期对象；
         */
        getDateObj: function(timestamp){
            return timestamp ? new Date(timestamp*1000) : new Date();
        },
        /**
         * 根据传进来的Unix时间戳，以及type值，格式化成不同的日期格式；
         */
        formatDate: function(timestamp,type){
            if(!timestamp) return false;
            
            timestamp = typeof timestamp!=='object' ? [timestamp] : timestamp;
            type = type || 2;
            var me = this,
                dateObj = null,
                week_name = me.week_name,
                year, month, day, week,
                date = [],
                dateformat = '';
            switch(type){
                case 1:
                    dateformat = '{year}年{month}月{day}日';
                break;
                case 2:
                    dateformat = '{year}-{month}-{day}';
                break;
                case 3:
                    dateformat = '{year}年{month}月{day}日({week})';
                break;
                case 4:
                    dateformat = '{year}年{month}月';
            }
            var fix2Length = util.fix2Length;
            for(var i=0,len=timestamp.length; i<len; i++){
                dateObj = me.getDateObj(timestamp[i]);
                year  = dateObj.getFullYear();
                month = fix2Length(dateObj.getMonth()+1);
                day  = fix2Length(dateObj.getDate());
                week = dateObj.getDay();
                date[i] = dateformat.replace('{year}', year)
                                .replace('{month}', month)
                                .replace('{day}', day)
                                .replace('{week}', week_name[week]);
            }
            return date;
        },
        /**
         * 根据Unix时间戳格式化成小时的时间;
         * @param timestamp
         * @param type
         * @returns
         */
        formatTime: function(timestamp,type){
            if(!timestamp) return false;
            
            timestamp = typeof timestamp!=='object' ? [timestamp] : timestamp;
            type = type || 1;
            var me = this,
                dateObj = null,
                hour, minute,
                times = [],
                timeformat = '';
            switch(type){
                case 1:
                    timeformat = '{hour}';
                break;
                case 2:
                    timeformat = '{hour}点{minute}分';
                break;
            }
            for(var i=0,len=timestamp.length; i<len; i++){
                dateObj = me.getDateObj(timestamp[i]);
                hour = dateObj.getHours();
                minute = dateObj.getMinutes();
                times[i] = timeformat.replace('{hour}', hour);
                times[i] = minute ? times[i].replace('{minute}', mimute) : times[i].replace('{minute}分', '');
            }
            return times;
        },
        /**
         * 获取上一个日期；---根据type类型(year,month,week,day)，有前一年、上一月、上一星期、昨天；
         */
        getPrevDateObj: function(timestamp, type){
            var me = this,
                prev_timestamp = me.getPrevDateTime(timestamp, type);
            
            return new Date(prev_timestamp*1000);
        },
        /**
         * 获取上一个日期的起始时间戳；---根据type类型(year,month,week,day)，有前一年、上一月、上一星期、昨天；
         * @param timestamp
         * @param type
         * @returns {Number}
         */
        getPrevDateTime: function(timestamp, type){
            var me = this;
            timestamp = (timestamp || me.month[0])*1000;
            type = type || me.showType;
            var prev_timestamp = 0,
                theDate = new Date(timestamp),
                the_year  = theDate.getFullYear(),
                the_month = theDate.getMonth()+1,
                the_day   = theDate.getDate();

            switch(type){
                case 'month':
                    var prev_month = the_month-1,
                        prev_month_year = the_year;
                    if (prev_month === 0) {
                        prev_month = 12;
                        prev_month_year -= 1;
                    }
                    prev_timestamp = Date.parse(prev_month + '/1/' + prev_month_year);
                break;
                case 'week':
                    prev_timestamp = Date.parse(the_month + '/' + the_day + '/' + the_year)-me.oneweek*1000;
                break;
                case 'day':
                    prev_timestamp = Date.parse(the_month + '/' + the_day + '/' + the_year)-me.oneday*1000;
                break;
                case 'year':
                    prev_timestamp = Date.parse(the_month + '/1/' + (the_year-1));
                break;
            }
            return prev_timestamp/1000;
        },
        /**
         * 获取下一个日期；---根据type类型(year,month,week,day)，有明年、下一月、下一星期、明天；
         */
        getNextDateObj: function(timestamp, type){
            var me = this,
                next_timestamp = me.getNextDateTime(timestamp, type);
            
            return new Date(next_timestamp*1000);
        },
        /**
         * 获取下一个日期的起始时间戳；---根据type类型(year,month,week,day)，有明年、下一月、下一星期、明天；
         * @param timestamp
         * @param type
         * @returns {Number}
         */
        getNextDateTime: function(timestamp, type){
            timestamp = (timestamp || me.month[0])*1000;
            type = type || me.showType;
            var me = this,
                next_timestamp = 0,
                theDate = new Date(timestamp),
                the_year  = theDate.getFullYear(),
                the_month = theDate.getMonth()+1,
                the_day   = theDate.getDate();
                
            switch(type){
                case 'month':
                    var next_month = the_month+1,
                        next_month_year = the_year;
                    if (next_month === 13) {
                        next_month = 1;
                        next_month_year += 1;
                    }
                    next_timestamp = Date.parse(next_month + '/1/' + next_month_year);
                break;
                case 'week':
                    next_timestamp = Date.parse(the_month + '/' + the_day + '/' + the_year)+me.oneweek*1000;
                break;
                case 'day':
                    next_timestamp = Date.parse(the_month + '/' + the_day + '/' + the_year)+me.oneday*1000;
                break;
                case 'year':
                    next_timestamp = Date.parse(the_month + '/1/' + (the_year+1));
                break;
            }
            return next_timestamp/1000;
        },
        /**
         * 下个星期；
         */
        nextWeek: function(){
            var me = this;
            me.setDay(me.day[0]+me.oneweek);//根据传入的时间戳，设置天、周、月份的起止点;
            me.showWeek();
        },
        /**
         * 上个星期；
         */
        prevWeek: function(){
            var me = this;
            me.setDay(me.day[0]-me.oneweek);//根据传入的时间戳，设置天、周、月份的起止点;
            me.showWeek();
        },
        /**
         * 显示当前me.week中所处时间段所指的周历;
         */
        showWeek: function(){
            var me = this,
                oneday  = me.oneday,
                month = me.month,
                fixed = me.fixed_date,
                week  = me.week;
            var weekArr = me.getWeekDateArr(week[0], week[1]),
                    days   = weekArr[0],
                    weeks  = weekArr[1],
                    months = weekArr[2],
                    years  = weekArr[3],
                t_week = [week[0], week[1]-oneday],
                week_format = me.formatDate(t_week,1),
                week_str = me.drawWeekCalendar(days, weeks, months, years),
                monthArr = me.getMonthDateArr(month[0],month[1],fixed[0],fixed[1]),
                miniMonth_str = me.drawMiniMonth(monthArr[0], monthArr[1], monthArr[2]);
            me.$mainGridOuter.html(week_str);
            me.fixGridHeight('week');//修复周日历的格子高度;
            me.scrollToNowPos();
            
            $('#yyMiniCalendar').html(miniMonth_str);
            $('#yyCalendarDate').html(week_format[0]+'-'+week_format[1]);
        },
        /**
         * 滚动到当前时刻时间点,将其定位在周、日面板中间;
         * （现在改成固定滚动到8点钟的位置）
         */
        scrollToNowPos: function(){
            var me = this,
                $weekBlock = $('#yyCalendarWeekBlock');
                // alert(me.$window.height()+'+'+me.$window.width());
            // $weekBlock.scrollTop(me.nowPos-$weekBlock.height()/2);
            $weekBlock.scrollTop(336);//336
        },
        /**
         * 获取星期日历数组;
         */
        getWeekDateArr: function(start_time, end_time){
            var me = this,
                oneday = me.oneday,
                startObj = me.getDateObj(start_time),
                endObj   = me.getDateObj(end_time-oneday),
                years  = [startObj.getFullYear(), endObj.getFullYear()],
                month_start = startObj.getMonth()+1,
                month_end   = endObj.getMonth()+1,
                week_start = startObj.getDay(),
                week_end   = endObj.getDay(),
                day_start = startObj.getDate(),
                day_end   = endObj.getDate(),
                day_len = (end_time - start_time)/oneday,
                days = [], weeks = [], months = [], i = 0, j = 0, k = 0, t = 0;
            if(month_start===month_end){
                for(; k<day_len; k++){
                    days[k]   = day_start+k;
                    months[k] = month_start;
                    weeks[k]  = week_start++;
                    if(week_start===7) week_start = 0;
                }
            }
            else{
                while(day_end){
                    t = day_len-1-i;
                    days[t]   = day_end;
                    months[t] = month_end;
                    weeks[t]  = week_end--;
                    if(week_end===-1) week_end = 6;
                    i++; day_end--;
                }
                while((j+i)<day_len){
                    days[j]   = day_start + j;
                    months[j] = month_start;
                    weeks[j]  = week_start++;
                    if(week_start===7) week_start = 0;
                    j++;
                }
            }
            return [days, weeks, months, years];
        },
        nowPos:0,
        /**
         * 画出星期月历;
         */
        drawWeekCalendar: function(days, weeks, months, years, day_num){
            //日历天数，可以是小日历内的任意天数（note:目前只考虑1和7天，即单天和从周一开始的整周）;
            day_num = day_num || 7;
            var me = this,
                line_height = me.line_height,
                week_name = me.week_name,
                oneday = me.oneday,
                today = me.today,
                today_timestamp = today.timestamp,
                time_range = day_num===1 ? me.day : me.week,
                height = me.hour_height,
                i = 0, j = 0, k = 24, w = 0, str_arr = [], allday_str_arr = [],
                table_height = height*k,
                now_timestamp = parseInt(new Date().getTime()/1000),
                now_to_top = ((now_timestamp-today_timestamp)/oneday)*table_height,
                start_timestamp = me.getTimestamp(years[0],months[0],days[0]), 
                flag_HasToday = me.hasToday(time_range[0], time_range[1]),
                today_pos = flag_HasToday ? (today_timestamp-time_range[0])/oneday : 0;
            me.nowPos = now_to_top;
            str_arr.push('<div class="yy-calendar-main-header" style="height:auto;overflow:hidden;"><table cellspacing="0" cellpadding="0" class="riliTable"><tr><td style="width:50px;overflow:hidden;text-align:center;">24小<br />时制 </td>');
            for(; i<day_num; i++){
                str_arr.push('<td'+(day_num===7 ? '' : ' style="text-align:center;"')+'><span class="alignLeft">',months[i],'/',days[i],'</span>',week_name[weeks[i]],'</td>');
                allday_str_arr.push('<td day="',days[i],'" week="',(weeks[i]?weeks[i]:7),'" timestamp="',(start_timestamp+oneday*i),'" class="yy-calendar-valid yy-calendar-day-grid',(flag_HasToday&&today_pos===i?' yy-calendar-today':''),'"><div class="yy-calendar-content relative"></div></td>');
            }
            str_arr.push('<td rowspan="2" style="width:16px;border:none;"></td></tr><tr class="yy-calendar-allday yueliTable" style="height:',(line_height+5),'px;"><td style="text-align:center;vertical-align:middle;">全天</td>',allday_str_arr.join(''),'</tr></table></div>');
            str_arr.push('<div class="yy-calendar-week-block yy-calendar-main" id="yyCalendarWeekBlock" style="position:relative;"><div style="margin-top:0px;" class="yy-mainwrapper">',
                '<table cellspacing="0" cellpadding="0" style="table-layout:fixed;height:',table_height,'px" class="yy-calendar-day-table"><tbody>',
                '<tr height="1"><td style="width:51px;*width:50px;"></td>',
                '<td colspan="',day_num,'"><div class="yy-spanningwrapper"><div class="yy-hourmarkers">');
            for(; k>0; k--){
                str_arr.push('<div class="yy-markercell"><div class="yy-dualmarker"></div></div>');
            }
            str_arr.push('</div></div><div id="yySpanningWrapper" class="yy-spanningwrapper yy-chipspanningwrapper"></div></td><td rowspan="2" style="width:0px;*width:17px;"></td></tr>');
            
            //显示主体;
            str_arr.push('<tr><td class="yy-calendar-day-times">');
            for(; j<24; j++){
                str_arr.push('<div style="height:',height,'px;"><div style="height:',height,'px;" class="yy-calendar-day-time">',j,'点</div></div>');
            }
            str_arr.push('<div style="left:0px;top:',(now_to_top-4),'px;" class="yy-nowptr" id="yyNowptr"></div></td>');
            
            var td_class = '',//'yy-calendar-today-block yy-calendar-weekend'
                tg_gutter = 'yy-gutter',
                now_marker = '',
                task_str = '', today_str = '';
            for(; w<day_num; w++){
                td_class = 'yy-calendar-day-block',
                today_str = '',
                now_marker = '';
                if(flag_HasToday&&today_pos===w){
                    td_class = 'yy-calendar-today-block',
                    today_str = '<div style="height:'+table_height+'px;margin-bottom:-'+table_height+'px;" class="yy-calendar-today">&nbsp;</div>',
                    now_marker = '<div style="top:'+now_to_top+'px;" id="yyNowmarker" class="yy-hourmarker yy-nowmarker"></div>';
                }
                td_class += w>4 ? ' yy-calendar-weekend':'';
                str_arr.push('<td class="',td_class,'">',today_str,'<div style="height:',table_height,'px;margin-bottom:-',
                        table_height,'px" class="yy-col-taskwrapper" id="yyCol',w,'"><div class="',tg_gutter,'">',
                        task_str,'</div></div><div class="yy-col-overlaywrapper" id="yyOver',w,'">',now_marker,'</div></td>');
            }
            str_arr.push('</tr></tbody></table></div></div>');
            return str_arr.join('');
        },
        /**
         * 后一天；
         */
        nextDay: function(){
            var me = this;
            me.setDay(me.day[0]+me.oneday);
            me.showDay();
        },
        /**
         * 前一天；
         */
        prevDay: function(){
            var me = this;
            me.setDay(me.day[0]-me.oneday);
            me.showDay();
        },
        /**
         * 显示当前me.day所指天的日历;
         */
        showDay: function(){
            var me = this,
                day   = me.day,
                month = me.month,
                fixed = me.fixed_date;
            var dayArr = me.getWeekDateArr(day[0],day[1]),
                    days   = dayArr[0],
                    weeks  = dayArr[1],
                    months = dayArr[2],
                    years  = dayArr[3],
                day_str = me.drawDayCalendar(days, weeks, months, years),
                day_format = me.formatDate(day[0],1),
                monthArr = me.getMonthDateArr(month[0],month[1],fixed[0],fixed[1]),
                miniMonth_str = me.drawMiniMonth(monthArr[0], monthArr[1], monthArr[2]);
            me.$mainGridOuter.html(day_str);
            me.fixGridHeight('day');//修复周日历的格子高度;
            me.scrollToNowPos();
            
            $('#yyMiniCalendar').html(miniMonth_str);
            $('#yyCalendarDate').html(day_format[0]);
        },
        /**
         * 获取起止时间天日历数组;
         */
        getDayArr: function(start_time, end_time){
            var me = this,
                week_name = me.week_name,
                dayObj = me.getDateObj(start_time),
                years  = [dayObj.getFullYear()],
                months = [dayObj.getMonth()+1],
                days   = [dayObj.getDate()],
                week_pos = dayObj.getDay(),
                dateArr = [months[0]+'/'+days[0]];
            week_pos = week_pos===0 ? 6 : (week_pos-1);
            var weekNameArr = [week_name[week_pos]];
            return [dateArr, weekNameArr, months, years];
        },
        /**
         * 画出天月历;
         */
        drawDayCalendar: function(days, weeks, months, years){
            var me = this;
            return me.drawWeekCalendar(days, weeks, months, years, 1);
        },
        /**
         * 修复月日历的起止日期；
         * 由于me.month中保存的起止日期是从当月初到下月初的，
         *      没有涵盖日历上的所有日期，所以将其修复覆盖所有日期；
         */
        fixMonthDate: function(start_time,end_time){
            var me = this,
                oneday = me.oneday,
                startObj = me.getDateObj(start_time),
                startObj_weekday = startObj.getDay(),
                endObj = me.getDateObj(end_time),
                endObj_weekday = endObj.getDay(),
                fixedMonthDate = [];
            startObj_weekday = startObj_weekday ? startObj_weekday : 7;
            endObj_weekday   = endObj_weekday ? endObj_weekday : 7;
            fixedMonthDate[0] = start_time-(startObj_weekday-1)*oneday;
            fixedMonthDate[1] = end_time+(8-endObj_weekday)*oneday;
            return fixedMonthDate;
        },
        /**
         * 获取当前task在日历中的可显示(垂直)位置;
         * @return 位置点，大于等于0的自然数；0表示最顶部的位置;
         */
        getTaskPos: function(taskPos, task_starttime){
            var k = 0;
            if(typeof taskPos[task_starttime]!=='undefined'){
                for(; k<999; k++)
                    if($.inArray(k, taskPos[task_starttime])===-1){
                        taskPos[task_starttime].push(k);
                        break;
                    }
            }
            else {
                taskPos[task_starttime] = [k];
            }
            return k;
        },
        /**
         * 设置task跨越的天数中task所占用的位置;
         * @param taskPos 记录task所在位置的数据对象集合;
         * @param task_starttime task的起始时间;
         * @param k   task所在的位置
         * @param num task跨越的天数;
         */
        setTaskPos: function(taskPos, task_starttime, k, num){
            var me = this,
                oneday = me.oneday,
                i = 0;
            task_starttime = parseInt(task_starttime);
            num = num || 1;
            for(; i<num; i++){
                timestamp = task_starttime+i*oneday;
                if(typeof taskPos[timestamp]!=='undefined'){
                    $.inArray(k, taskPos[timestamp])===-1 
                        && taskPos[timestamp].push(k);
                }
                else {
                    taskPos[timestamp] = [k];
                }
            }
        },
        /**
         * 添加task条;
         * @param taskDatas
         * @param taskData_pos          taskData在taskDatas中的位置;
         * @param $taskStartGridContent task条开始的grid对象;
         * @param pos                   task条所在的位置;
         * @param cross_grid_num        task所跨越的天数;
         * @param left_arrow            task条是否包含左箭头;
         * @param right_arrow           task条是否包含右箭头;
         */
        addTaskLine: function(taskDatas, taskData_pos, $taskStartGridContent, pos, cross_grid_num, left_arrow, right_arrow){
            var me = this,
                taskData = taskDatas[taskData_pos],
                isSelf = intParse(me.selfid)===intParse(taskData[5]) ? true : false,
                // 设置颜色;
                color = taskData[9] == 25 
                        ? (isSelf ? me.taskcolor : me.taskcolor2)
                        : (isSelf ? me.schecolor : me.schecolor2),
                oneday = me.oneday,
                task = me.task,
                    segment_width  = task.segment_width,
                    segment_height = task.segment_height,
                month = me.month,
                    start_time = month[0],
                    end_time   = month[1],
                fixdate = me.fixMonthDate(start_time, end_time),
                top_start = me.top_start,//task的距离日期格子顶部的起始高度；
                line_height = me.line_height,//(segment_height-top_start)/line_num,//task条的实际占用的空间高度;
                fix_line_height = line_height-2,//减2，修复除去边框的高度;
                line_num  = Math.floor((segment_height-top_start)/line_height),//日期格子中可以显示的task条数;
                $taskStartGrid = $taskStartGridContent.closest('td'), 
                taskStartGrid_timestamp = parseInt($taskStartGrid.attr('timestamp')),
                taskStartGrid_week = parseInt($taskStartGrid.attr('week')),
                $taskStartGridContentTaskLast, 
                $moreTask = $taskStartGridContent.children('.absolute').filter('.more-task'), 
                moreTask_num, taskData_prev,
                i = 1, prevtask_starttime, prevtask_endtime, left_arrow_str, right_arrow_str, 
                task_str = '',task_width, arrow_width = me.arrow_width;
            // util.trace(segment_width)
            // util.trace(task)
            //如果pos位置小于line_num数量，并且不在pos等于(line_num-1)时，more-task长度为大于0的情况....
            if(pos<line_num && !(pos===(line_num-1)&&$moreTask.length)){//表示当前task将被显示的添加到日历框中;
                left_arrow_str  = left_arrow ? '<div class="st-ad-ml"></div><div class="st-ad-ml2"></div>' : '';
                right_arrow_str = right_arrow? '<div class="st-ad-mr"></div><div class="st-ad-mr2"></div>' : '';
                task_width = cross_grid_num*segment_width-4;
                    task_width = left_arrow ? (task_width-arrow_width) : task_width; // 减去左箭头宽度
                    task_width = right_arrow? (task_width-arrow_width) : task_width; // 减去右箭头宽度（和是否存在左箭头无关）

                var title_str = '';
                if (taskData[14]) {
                    title_str = taskData[6]+'-'+taskData[7]+' '+taskData[1];
                }
                else {
                    var start_obj = me.getDateObj(taskData[2]),
                        start_year  = start_obj.getFullYear(),
                        start_month = start_obj.getMonth()+1,
                        start_day   = start_obj.getDate(),
                        end_obj = me.getDateObj(taskData[7]==='00:00' ? taskData[3] : taskData[3]-86400);
                        end_year  = end_obj.getFullYear(),
                        end_month = end_obj.getMonth()+1,
                        end_day   = end_obj.getDate(),
                    title_str = start_year+'/'+start_month+'/'+start_day+' '+taskData[6]+'-'+
                                end_year+'/'+end_month+'/'+end_day+' '+taskData[7]+
                                ' '+taskData[1];
                }

                task_str = '<div cid="'+taskData[0]+'" fromid="'+taskData[8]+'" type="'+taskData[9]+'" feedid="'+taskData[11]+'" '//cid,from_id,type,feed_id
                    +'title="'+title_str+'"'
                    +'class="yy-calendar-task absolute '+(taskData[14]?color+'Font rc':color)//isHour
                    +'" endtime="'+taskData[3]+'" style="width:'+task_width+'px;'//day,continued
                    +'height:'+fix_line_height+'px;line-height:'+fix_line_height+'px;'
                    +'top:'+(top_start+line_height*pos)+'px;left:'+(left_arrow?(arrow_width+1):1)+'px">'+left_arrow_str+right_arrow_str
                    +'<span class="yy-calendar-task-line">'+taskData[1]+'</span></div>';
                $taskStartGridContent.append(task_str);
            }
            else {
                $taskStartGridContentTaskLast = $moreTask.length ? $moreTask
                        : $taskStartGridContent.children('.absolute').last();
                if($taskStartGridContentTaskLast.length){
                    if($taskStartGridContentTaskLast.hasClass('more-task')){
                        moreTask_num = parseInt($taskStartGridContentTaskLast.attr('num'));
                        $taskStartGridContentTaskLast.attr('num', moreTask_num+1)
                                .children('span').html('+'+(moreTask_num+1)+'更多项');
                    }
                    else {
                        taskLast_width = parseInt($taskStartGridContentTaskLast.css('width'));
                        //加上Math.round确保跨越天数为整数;
                        cross_day = Math.round((taskLast_width+4)/segment_width);
                        //将已经存在的跨天任务转化成了more-task，然后将其后的横跨的那些天也设置成more-task;
                        if(cross_day>1){
                            $taskStartGrid.nextUntil('[timestamp="'+(taskStartGrid_timestamp+cross_day*oneday)+'"]').each(function(i){
                                var sub_task_str = '<div class="absolute rlhid more-task" num="1" style="width:'
                                    +(segment_width-4)+'px;height:'+fix_line_height+'px;line-height:'+fix_line_height+'px;'
                                    +'top:'+(top_start+line_height*(line_num-1))+'px;left:1px">'
                                    +'<span class="yy-calendar-task-line">+1更多项</span></div>';
                                $(this).children('.yy-calendar-content').append(sub_task_str);
                            });
                        }
                        $taskStartGridContentTaskLast.removeClass()
                                .addClass('absolute rlhid more-task').attr('num', 2)
                                .css({
                                    'width': (segment_width-4),
                                    'left' : '1px'
                                }).html('<span class="yy-calendar-task-line">+2更多项</span>');
                    }
                }
                else {
                    // YY.util.trace('t');
                    // YY.util.trace($taskStartGridContent);
                    task_str = '<div class="absolute rlhid more-task" num="2" style="width:'
                        +(segment_width-4)+'px;height:'+fix_line_height+'px;line-height:'+fix_line_height+'px;'
                        +'top:'+(top_start+line_height*(line_num-1))+'px;left:1px">'
                        +'<span class="yy-calendar-task-line">+2更多项</span></div>';
                    $taskStartGridContent.append(task_str);
                    for(; ; i++){
                        if(i>taskData_pos) break;
                        taskData_prev = taskDatas[taskData_pos-i];
                        if(taskData_prev[2]<taskData[2]&&taskData_prev[3]>=taskData[2]){
                            //修复后的起止时间;
                            start_time = fixdate[0];
                            end_time   = fixdate[1];
                            prevtask_starttime = taskData_prev[2];
                            prevtask_endtime   = taskData_prev[3];
                            //修复日程的起止时间;
                            prevtask_starttime = prevtask_starttime>=start_time ? prevtask_starttime : start_time;
                            prevtask_endtime   = prevtask_endtime>=end_time ? end_time : prevtask_endtime;
                            //修复prevtask_starttime起点为和$taskStartGrid同一行的某个点;
                            prevtask_starttime = (taskStartGrid_timestamp-(taskStartGrid_week-1)*oneday)<prevtask_starttime 
                                    ? prevtask_starttime : (taskStartGrid_timestamp-(taskStartGrid_week-1)*oneday);
                            $taskStartGrid_prev = $taskStartGrid.siblings('[timestamp="'+prevtask_starttime+'"]').eq(0);
                            $taskStartGrid_prevTaskLast = $taskStartGrid_prev.find('.absolute').last();
                            taskStartGrid_prevTaskLast_width = $taskStartGrid_prevTaskLast.width();
                            $taskStartGrid_prevTaskLast.removeClass()
                                .addClass('absolute rlhid more-task').attr('num', 1)
                                .css({
                                    'width': (segment_width-4),
                                    'left' : '1px'
                                }).html('<span class="yy-calendar-task-line">+1更多项</span>');
                            //加上Math.round确保跨越天数为整数;
                            cross_day = Math.round((taskStartGrid_prevTaskLast_width+4)/segment_width);
                            if(cross_day>2){
                                $taskStartGrid_prev.nextUntil('[timestamp="'+(prevtask_starttime+cross_day*oneday)+'"]').each(function(i){
                                    var $crossDayContent = $(this).children('.yy-calendar-content'),
                                        sub_task_str = '';
                                    if(!$crossDayContent.children('.absolute').last().hasClass('more-task')){
                                        sub_task_str = '<div class="absolute rlhid more-task" num="1" style="width:'
                                            +(segment_width-4)+'px;height:'+fix_line_height+'px;line-height:'+fix_line_height+'px;'
                                            +'top:'+(top_start+line_height*(line_num-1))+'px;left:1px">'
                                            +'<span class="yy-calendar-task-line">+1更多项</span></div>';
                                        $crossDayContent.append(sub_task_str);
                                    }
                                });
                            }
                            break;
                        }
                    }
                }
                if(cross_grid_num>1){//当前添加task所跨天数;
                    $taskStartGrid.nextUntil('[timestamp="'+(taskStartGrid_timestamp+cross_grid_num*oneday)+'"]').each(function(i){
                        var $content = $(this).children('.yy-calendar-content'),
                            $taskLast = $content.children('.absolute').last(),
                            sub_task_str = '', moreTask_num_t;
                        if($taskLast.hasClass('more-task')){
                            moreTask_num_t = parseInt($taskLast.attr('num'));
                            $taskLast.attr('num', moreTask_num_t+1)
                                    .children('span').html('+'+(moreTask_num_t+1)+'更多项');
                        }
                        else {
                            sub_task_str = '<div class="absolute rlhid more-task" num="1" style="width:'
                                +(segment_width-4)+'px;height:'+fix_line_height+'px;line-height:'+fix_line_height+'px;'
                                +'top:'+(top_start+line_height*(line_num-1))+'px;left:1px">'
                                +'<span class="yy-calendar-task-line">+1更多项</span></div>';
                            $content.append(sub_task_str);
                        }
                    });
                }
            }//else END
        },
        /**
         * 画出日程；
         */
        drawCrossDayTask: function(start,end,selector,timeflag){
            timeflag = (typeof timeflag ==='undefined') ? true : timeflag;
            var me = this,
                oneday = me.oneday,
                $monthGrid = me.$mainGridOuter.find(selector),
                $monthGrid_clone = $monthGrid.clone(),
                $mainGridTd = $monthGrid_clone.find('td.yy-calendar-day-grid'),
                cw = 2, kk = 0,
                $crossWeekGrid, crossWeekGrid_startpos,
                crossWeekGrid_timestamp,
                left_arrow, right_arrow;

                // YY.util.trace($monthGrid);
                // YY.util.trace($monthGrid_clone);
            // 循环taskDatas，匹配出当前日历的task，然后处理...;
            // taskData[2]；开始日期
            // taskData[3]：结束日期
            var taskData = null, 
                taskDatas = me.getTaskData(start, end),// 获取可能存在的task..
                task_starttime_orig, task_endtime_orig, 
                task_starttime, task_endtime, continued,
                startpos, $taskStartGrid, $taskStartGridContent, taskStartGrid_week,
                taskPos = {};
            for(var i = 0, len = taskDatas.length; i<len; i++){
                taskData = taskDatas[i];
                // 如果task条的起止日期，都在当前日历的起止时间之外，那么直接continue到下一条处理;
                if(taskData[3]<=start || taskData[2]>=end) continue;
                // 非跨天日程，直接跳过; timeflag为 false ，并且taskData[14]为 true ...
                if(!timeflag && taskData[14]) continue;
                // task的实际起止时间;
                task_starttime_orig = taskData[2];
                task_endtime_orig   = taskData[3];
                // 修复日程的起止时间-以及持续时间(为了将其限定在日历之内，以便展示出来);
                task_starttime = task_starttime_orig>=start ? task_starttime_orig : start;
                task_endtime   = task_endtime_orig>=end ? end : task_endtime_orig;
                continued = (task_endtime-task_starttime)/oneday;
                // 如果当前task的起始时间，和前一个task的起始时间不相同...那么就重新赋值；
                startpos = Math.floor((task_starttime-start)/oneday);// Math.floor用来修复非全天日程；
                $taskStartGrid = $mainGridTd.eq(startpos);// 找到task的起始位置;
                $taskStartGridContent = $taskStartGrid.children('.yy-calendar-content');
                taskStartGrid_week = parseInt($taskStartGrid.attr('week'));// task起始位置的星期；
                // 获取task条在当前日期框中可显示的(垂直)位置;
                var k = me.getTaskPos(taskPos, task_starttime);
                // 此牛叉task跨越的周数;
                var cross_week = (continued+taskStartGrid_week)>8
                                ? Math.ceil((continued+taskStartGrid_week-1)/7) 
                                : 1;
                // 跨周任务结束位置所跨天数;
                var end_num = cross_week>1 
                            ? ((continued+taskStartGrid_week-1)%7===0 
                                    ? 7 
                                    : (continued+taskStartGrid_week-1)%7)
                            : 0;
                // 跨天task，在起始周跨越的天数;
                var cross_grid_num = cross_week>1 ? (8-taskStartGrid_week) : continued;
                // 设置task横跨的天中的task所处的位置(横向占位);
                me.setTaskPos(taskPos, task_starttime, k, cross_grid_num);
                // 添加task条;
                // 是否拥有左、右箭头;
                var left_arrow  = (task_starttime === task_starttime_orig) ? false : true,
                    right_arrow = (task_endtime === task_endtime_orig && end_num === 0) ? false : true;
                // 添加task条;
                me.addTaskLine(taskDatas, i, $taskStartGridContent, k, cross_grid_num, left_arrow, right_arrow);
                // 添加跨周的task条，即是折行的task;
                for(; cw<=cross_week; cw++){
                    crossWeekGrid_startpos = startpos+(8-taskStartGrid_week)+(cw-2)*7;
                    $crossWeekGrid = $mainGridTd.eq(crossWeekGrid_startpos);
                    if($crossWeekGrid.length){
                        crossWeekGrid_timestamp = parseInt($crossWeekGrid.attr('timestamp'));
                        cross_grid_num = cw===cross_week ? end_num : 7;
                        kk = me.getTaskPos(taskPos, crossWeekGrid_timestamp);
                        //设置task横跨的天中的task所处的位置;
                        me.setTaskPos(taskPos, crossWeekGrid_timestamp, kk, cross_grid_num);
                        //添加task条;
                        left_arrow  = true;
                        right_arrow = (cw===cross_week&&task_endtime===taskData[3]) ? false : true;
                        me.addTaskLine(taskDatas, i, $crossWeekGrid.children('.yy-calendar-content'), kk, cross_grid_num, left_arrow, right_arrow);
                    }
                }
                cw = 2;
            }
            $monthGrid.replaceWith($monthGrid_clone);
            // YY.util.trace(taskPos);
        },
        /**
         * 根据起止时间，获取其存在于responseData中的task段;
         */
        getTaskData: function(start_time, end_time){
            var me = this,
                responseData = me.responseData,
                key_arr = me.getTaskDataKey(start_time, end_time),
                taskDatas = [];
            // YY.util.trace(key_arr);
            $.each(key_arr, function(i,key){
                if(i===0){
                    taskDatas = taskDatas.concat(responseData[key]);
                }
                else {
                    var timestamps = key.split('-');
                    $.each(responseData[key],function(k,taskData){
                        if(taskData[2]>=timestamps[0]){
                            taskDatas.push(taskData);
                        }
                    });
                }
            });
            // YY.util.trace(taskDatas);
            return taskDatas;
        },
        /**
         * 获取起止时间的task段，在responseData中存在的key值;
         */
        getTaskDataKey: function(start_time, end_time){
            var me = this,
                responseData = me.responseData,
                key_arr = [];
            $.each(responseData, function(k){
                var timestamps = k.split('-');
                if(timestamps[0]>=end_time || timestamps[1]<=start_time) return true;
                key_arr.push(k);
            });
            return key_arr;
        },
        initTask: function(){
            var me = this,
                $mainGrid = me.$mainGridOuter.children('#yyCalendarMonthGrid'),
                mainGrid_offset = $mainGrid.offset(),
                $mainGridTd = $('.yy-calendar-valid', $mainGrid).eq(0);
            me.task = {
                mainGrid_width:  $mainGrid.width(),
                mainGrid_height: $mainGrid.height(),
                mainGrid_left: mainGrid_offset ? mainGrid_offset.left : 0,
                mainGrid_top:  mainGrid_offset ? mainGrid_offset.top : 0,
                segment_time: me.oneday,
                segment_width_average : $mainGrid.outerWidth()/7,
                segment_height_average: $mainGrid.outerHeight()/me.week_count,
                segment_width : $mainGridTd.outerWidth(),
                segment_height: $mainGridTd.outerHeight() ? $mainGridTd.outerHeight() : 120,
                $start: null,
                $end: null,
                start_time: 0,
                end_time  : 0,
                start_left: 0,
                start_top : 0,
                end_left: 0,
                end_top : 0,
                start_x: 0,
                start_y: 0,
                end_x: 0,
                end_y: 0
            };
        },
        /**
         * 重新修复task相关值，这些值不仅仅影响如何画出task，并且还会影响创建task时日期的选择;
         */
        fixTask: function(){
            var me = this,
                task = me.task,
                $mainGrid = me.$mainGridOuter.children('#yyCalendarMonthGrid'),
                mainGrid_offset = $mainGrid.offset(),
                $mainGridTd = $('.yy-calendar-valid', $mainGrid).eq(0);
            
            task.mainGrid_width = $mainGrid.width();
            task.mainGrid_height = $mainGrid.height();
            task.mainGrid_left = mainGrid_offset.left;
            task.mainGrid_top  = mainGrid_offset.top;
            task.segment_time   = me.oneday;
            task.segment_width  = $mainGridTd.outerWidth();
            task.segment_height = $mainGridTd.outerHeight();
        },
        /**
         * 设置body上的user-select样式；
         * @param flag为null或者true表示设置为不能选择，否则取消这种设置；
         */
        noSelect: function(flag){
            var me = this;
            me.$body.noSelect(flag);
        },
        /**
         * 判断鼠标位置是否在日历主表格内；
         * @param 在返回true，否则false；
         */
        isInMainGrid: function(pagex,pagey){
            var me = this,
                task = me.task,
                mainGrid_width = task.mainGrid_width,
                mainGrid_height = task.mainGrid_height,
                mainGrid_left = task.mainGrid_left,
                mainGrid_top  = task.mainGrid_top;
            return pagex>mainGrid_left&&pagey>mainGrid_top
                        &&pagex<(mainGrid_left+mainGrid_width)&&pagey<(mainGrid_top+mainGrid_height);
        },
        /**
         * 关闭浮动盒子;
         */
        closeFloatBox: function(){
            var me = this,
                $floatBox = $('#yyFloatbox');

            $floatBox.hide().css({visibility:'hidden'});

            return true;
        },
        // /**
        //  * 关闭创建面板;
        //  * @return {[type]} [description]
        //  */
        // closeCreatePanel: function() {
        //     var me = this,
        //         $createPanel = $('#yyCreatePanel');
        //     $createPanel.hide().css({visibility:'hidden'});
        //     me.removeCoverContainer();
        //     me.removeErrorFloatbox();
        //     me.removeNoPermissionFloatbox();
        //     if(this.timeSelectValue.div!=null){
        //         this.timeSelectValue.div.remove();
        //         this.timeSelectValue.div = null;
        //     }
        //     return true;
        // },
        /**
         * 删除错误提示的弹出框;
         * @return {[type]} [description]
         */
        removeErrorFloatbox: function() {
            $('#yyErrorFloatbox').remove();
        },
        /**
         * 删除无权限提示的弹出框;
         * @return {[type]} [description]
         */
        removeNoPermissionFloatbox: function() {
            $('#yyNoPermissionFloatbox').remove();
        },
        /**
         * 删除覆盖层;
         * @return {[type]} [description]
         */
        removeCoverContainer: function() {
            var $coverContainer = $('.yy-calendar-cover-container');

            $coverContainer.remove();
        },
        /**
         * 打开更多task框；
         */
        openMoreTaskBox: function(me, $taskGrid,timeflag){
            timeflag = typeof timeflag ==='undefined' ? true : false;
            var $mainGridOuter = me.$mainGridOuter,
                timestamp = parseInt($taskGrid.attr('timestamp')), 
                oneday = me.oneday,
                taskDatas = me.getTaskData(timestamp, timestamp+oneday),
                line_height = me.line_height,//(segment_height-top_start)/line_num,//task条的实际占用的空间高度;
                fix_line_height = line_height-2,//减2，修复除去边框的高度;
                task_str = '<div style="z-index:180;width:225px;" class="cc" id="yyMoreTaskBox">'
                    +'<div class="cc-titlebar"><div class="cc-close" id="yyMoreTaskBoxClose">×</div>'
                    +'<div class="cc-title">'+me.formatDate(timestamp, 3)[0]+'</div></div>'
                    +'<div class="cc-body"><div class="st-contents"><table cellspacing="0" cellpadding="0" class="st-grid">',
                left_arrow_str  = '<div class="st-ad-ml"></div><div class="st-ad-ml2"></div>',
                right_arrow_str = '<div class="st-ad-mr"></div><div class="st-ad-mr2"></div>',
                height_str = 'height:'+fix_line_height+'px;line-height:'+fix_line_height+'px;';
            $.each(taskDatas, function(i, taskData){
                if(!timeflag&&taskData[14]) return true;
                // 设置颜色;
                var isSelf = intParse(me.selfid)===intParse(taskData[5]) ? true : false,
                    color = taskData[9] == 25 
                        ? (isSelf ? me.taskcolor : me.taskcolor2)
                        : (isSelf ? me.schecolor : me.schecolor2);
                if(timestamp>=taskData[2] && timestamp<taskData[3]){
                    var title_str = '';
                    if (taskData[14]) {
                        title_str = taskData[6]+'-'+taskData[7]+' '+taskData[1];
                    }
                    else {
                        var start_obj = me.getDateObj(taskData[2]),
                            start_year  = start_obj.getFullYear(),
                            start_month = start_obj.getMonth()+1,
                            start_day   = start_obj.getDate(),
                            end_obj = me.getDateObj(taskData[7]==='00:00' ? taskData[3] : taskData[3]-86400);
                            end_year  = end_obj.getFullYear(),
                            end_month = end_obj.getMonth()+1,
                            end_day   = end_obj.getDate(),
                        title_str = start_year+'/'+start_month+'/'+start_day+' '+taskData[6]+'-'+
                                    end_year+'/'+end_month+'/'+end_day+' '+taskData[7]+
                                    ' '+taskData[1];
                    }
                    task_str += '<tr title="'+title_str+'" class="yy-calendar-task borderFff" cid="'+taskData[0]+'" fromid="'+taskData[8]+'" type="'+taskData[9]+'" feedid="'+taskData[11]+'"><td class="st-c"><div class="st-c-pos">'
                            +'<div class="st-ad-mpad st-ad-mpadr rb-n '+(taskData[14]?color+'Font rc':color)+'" style="'+height_str+'"><div class="rb-ni">'
                            +(timestamp>taskData[2]?left_arrow_str:'')+((timestamp+oneday)<taskData[3]?right_arrow_str:'')
                            +taskData[1]+'</div></div></div></td></tr>';
                }
            });
            task_str += '</table></div></div></div>';
            $moreTaskBox = $(task_str);
            $mainGridOuter.append($moreTaskBox);
            var moreTaskBox_height = $moreTaskBox.outerHeight(),
                moreTaskBox_width  = $moreTaskBox.outerWidth(),
                gridOuter_height = $mainGridOuter.height(),
                gridOuter_width  = $mainGridOuter.width(),
                taskGrid_position = $taskGrid.position(),
                    taskGrid_position_left = taskGrid_position.left,
                    taskGrid_position_top  = taskGrid_position.top,
                left = (gridOuter_width-taskGrid_position_left)>moreTaskBox_width
                    ? taskGrid_position_left
                    : (gridOuter_width-moreTaskBox_width),
                top  = (gridOuter_height-taskGrid_position_top)>moreTaskBox_height 
                    ? taskGrid_position_top 
                    : (gridOuter_height-moreTaskBox_height);
            $moreTaskBox.css({
                'visibility': 'visible',
                'left': left,
                'top': top
            });
            return true;
        },
        /**
         * 关闭更多task框；
         */
        closeMoreTaskBox: function(){
            var $moreTaskBox = $('#yyMoreTaskBox');
            $moreTaskBox.remove();
            return true;
        },
        /**
         * 日历翻到下一页;
         */
        changeToNext: function(){
            var me = this;
            switch(me.showType){
                case 'month':
                    me.nextMonth();
                break;
                case 'week':
                    me.nextWeek();
                break;
                case 'day':
                    me.nextDay();
                break;
            }
            me.getData();
            return true;
        },
        /**
         * 日历翻到前一页;
         */
        changeToPrev: function(){
            var me = this;
            switch(me.showType){
                case 'month':
                    me.prevMonth();
                break;
                case 'week':
                    me.prevWeek();
                break;
                case 'day':
                    me.prevDay();
                break;
            }
            me.getData();
            return true;
        },
        /**
         * 刷新当前日历界面;
         */
        refreshCalendar: function(){
            var me = this;
            switch(me.showType){
                case 'month':
                    me.showMonth();
                break;
                case 'week':
                    me.showWeek();
                break;
                case 'day':
                    me.showDay();
                break;
            }
            me.getData();//获取数据，然后画出task条（暂时这么处理..）;
        },
        /**
         * 激活模式,日、周 或者 月;
         */
        activeMode: function($realTarget){
            var me = this,
                viewType = me.viewType,
                showType = me.showType,
                text = (showType===viewType[0])
                    ? '本月'
                    : (showType===viewType[1]
                            ? '本周'
                            : '今天');
            $realTarget.addClass('cur').siblings('a').removeClass('cur');
            $('.yy-calendar-hastoday').attr('mode',me.showType).html(text);
        },
        /**
         * 鼠标移动；
         */
        documentMouseMove: function(e, me){
            var $target = $(e.target);
            if(me.flagMousedown===1 ){
                // 选择跨天
                if (me.flagSelectDay) {
                    var page_x = e.pageX,
                        page_y = e.pageY,
                        coverRange = me.coverRange;
                    if(coverRange[0][0]< page_x && page_x < coverRange[1][0] 
                            && coverRange[0][1]< page_y && page_y < coverRange[1][1]) {
                        me.selectChange(e, me);
                    }
                }
                // me.flagSelectDay 
                //     && ($target.closest('.yy-calendar-cover-container').length || $target.closest('.yy-calendar-day-grid').length) 
                //     && me.selectChange(e, me);
                // 选择时刻
                if (me.flagSelectTime) {
                    me.timeSelectChange(e, me);
                }
            }

        },
        /**
         * 处理在document区域点下鼠标的操作;
         */
        documentMouseDown: function(e, me){
            var $target = $(e.target),
                $realTarget = null;
            !$target.closest('#yyMoreTaskBox').length && me.closeMoreTaskBox();//关闭更多task框;
            if (!($target.closest('#yyFloatbox').length
                    ||$target.closest('.calendar-dialog'))) {
                YY.hash.set(me.getHashBase());
                // me.closeFloatBox();// 关闭浮动层box;
            }
            // if (!($target.closest('#yyCreatePanel').length
            //         ||$target.closest('#fancybox-overlay').length
            //         ||$target.closest('#fancybox-wrap').length
            //         ||$target.closest('#ui-datepicker-div').length
            //         ||$target.closest('.time-list').length)) {
            //     me.closeCreatePanel();//关闭创建task的浮动框;
            // }
            if(($realTarget = $target.closest('#yyMiniCalendar')).length){
                $realTarget.noSelect();
            }
            if($target.closest('.yy-calendar-day-grid').length){//#yyCalendarMonthGrid
                //设置user-select为none;
                me.noSelect();
                !$target.closest('.absolute').length && me.selectStart(e, me);//开始选择日期...;
            }
            if(!$target.closest('.yy-gutter').length 
                    && $target.closest('.yy-col-taskwrapper').length){//时刻事件开始选择...
                //设置user-select为none；
                me.noSelect();
                me.timeSelectStart(e, me);//开始选择日期...;
            }
        },
        documentMouseUp: function(e, me){
            //结束日期范围的选择;
            if(me.flagMousedown===1){
                me.flagSelectDay && me.selectEnd(e, me);
                me.flagSelectTime && me.timeSelectEnd(e, me);
            }
        },
        /**
         * document区域的点击事件;
         */
        documentClick: function(e, me){
            if(!(e.which===1||e.which===0)) return true;
            var $target = $(e.target), 
                $realTarget = null,
                act = $target.attr('click'),
                flag = true,
                Biz = YY.calendarBiz;
            if ($target.closest('#yyCalendarNavNext').length) {//向后翻;
                me.changeToNext();
                YY.hash.set('m='+me.showType+'&t='+me.day[0]);
                flag = false;
            }
            if ($target.closest('#yyCalendarNavPrev').length) {//向前翻;
                me.changeToPrev();
                YY.hash.set('m='+me.showType+'&t='+me.day[0]);
                flag = false;
            }
            //打开更多task框；
            if (($realTarget = $target.closest('.more-task')).length) {
                ($realTarget.closest('.yy-calendar-allday').length 
                        ? me.openMoreTaskBox(me, $realTarget.closest('td'), false)
                        : me.openMoreTaskBox(me, $realTarget.closest('td'))) && (flag = false);
            }
            //关闭更多task框;
            if ($target.is('#yyMoreTaskBoxClose')) {
                me.closeMoreTaskBox() && (flag = false);
            }
            // 打开日程快照;
            if (($realTarget = $target.closest('.yy-calendar-task')).length) {
                var hash_base = me.getHashBase(),
                    hash = hash_base+'&action=shot&scheduleid='+$realTarget.attr('fromid')+'&type='+$realTarget.attr('type')+'&x='+e.pageX+'&y='+e.pageY;
                YY.hash.set(hash);
                // Biz.openTaskDetailBox(e, $realTarget.attr('fromid'), $realTarget.attr('type')) && (flag = false);
            }
            // 打开日程详情;
            if($target.is('.yy-schedule-detail')){
                var hash_base = me.getHashBase(),
                    hash = hash_base+'&action=detail&scheduleid='+$target.attr('fromid');
                YY.hash.set(hash);
            }
            // 激活日程编辑;
            if ($target.is('.yy-edit-active')) {
                var hash_base = me.getHashBase(),
                    hash = hash_base+'&action=edit&scheduleid='+$target.attr('fromid');
                YY.hash.set(hash);
                // me.scheduleEditActive(fromid, start, end) && (flag = false);
            }
            //========= 需要重置URL的一些点击操作。=========
            // 删除日程;
            if($target.is('.yy-delete')){
                var $operLine = $target.closest('div'),
                    // feed_id = $operLine.attr('feed_id'),
                    fromid  = $target.attr('fromid'),
                    // type    = $operLine.attr('type'),
                    start = $target.attr('start');
                    end = $target.attr('end');
                Biz.deleteTask(fromid, 25, start, end) && (flag = false);
                YY.hash.set(me.getHashBase());
            }
            if($target.closest('.yy-floatbox-close').length
                    || $target.closest('.calendar-dialog .close').length
                    || $target.is('.calendar-dialog .cancel')) {
                YY.hash.set(me.getHashBase());
                // me.closeFloatBox();//关闭浮动输入框;
                // me.closeCreatePanel();//关闭创建task的浮动框;
                flag = false;
            }

            //========= 小日历的点击操作 =========
            //小月历的翻动操作;
            $target.closest('.yy-next-month').length
                    && me.nextMiniMonth() && (flag = false);
            $target.closest('.yy-prev-month').length
                    && me.prevMiniMonth() && (flag = false);
            $target.closest('.yy-next-year').length
                    && me.nextMiniYear() && (flag = false);
            $target.closest('.yy-prev-year').length
                    && me.prevMiniYear() && (flag = false);
            if ($target.attr("type")=='mini') {
                me.clickMini($target);
                YY.hash.set('m='+me.showType+'&t='+me.day[0]);
                flag = false;
            }
            //视图的切换操作;
            if($target.is('.yy-view-button')){
                if (!$target.hasClass('cur')) {
                    // $('.rili_cont').show();
                    // $('#yyCalendarMainSearch').hide();
                    var view = $target.attr('view');
                    // var params = hash.parse(hash.get());
                    YY.hash.set('m='+view+'&t='+me.day[0]);
                    me.openCalendarView(view);//根据view值，切换为相应的视图；
                }
                me.activeMode($target);
                flag = false;
            }
            ($realTarget = $target.closest('.yy-calendar-hastoday')).length
                    && me.changeToToday($realTarget.attr('mode')) && (flag = false);
            //对其他用户的相关操作;
            if(($realTarget = $target.closest('.yy-user-item')).length){
                if($target.is('.yy-user-item-delete')){// 删除;
                    me.deleteUserFromList($target);
                }
                else {// 正常点击操作，切换到其的日历视图;
                    me.changeToTheUser($realTarget) && (flag = false);
                }
            }
            if (($realTarget = $target.closest('#yyFloatbox')).length) {
                Biz.handleFloatboxContent($target);
                // flag = false;
            }
            if(act){
                var act = Biz.actMap[act];
                typeof act!=='undefined' && Biz[act]($target);
            }
            
            return flag;
        },
        /**
         * 捕获document区域内的，按下键盘操作;
         */
        documentKeyDown: function(e, me){
            if(e.keyCode===27){
                // 关闭Float框、关闭dialog框..
                YY.hash.set(me.getHashBase());
                // me.closeFloatBox();
                // (!!$('#yyNoPermissionFloatbox').length || !!$('#yyErrorFloatbox').length || $('#yyCreatePanel').css('visibility')==='visible') 
                //         && me.closeCreatePanel();//关闭创建task的浮动框;
                // 关闭查看更多..
                me.closeMoreTaskBox();
            }
        },
        /**
         * 捕获document区域内的，键盘释放动作;
         */
        documentKeyUp: function(e, me){
            // var $target = $(e.target),
            //     Biz = YY.calendarBiz;
            // if($target.is('input[name="title"]')){
            //     Biz.handleFormStatus($target);
            // }
        },
        documentMouseOver: function(e, me){
            var $target = $(e.target),
                $realTarget = null,
                Biz = YY.calendarBiz;
            if($target.closest('.yy-calendar-operates').length){
                Biz.openOperateList($target);
            }
        },
        documentMouseOut: function(e, me){
            var $target = $(e.target),
                $relatedTarget = $(e.relatedTarget),
                Biz = YY.calendarBiz;
            if(($realTarget = $target.closest('.yy-calendar-operates')).length
                    &&!$relatedTarget.closest('.yy-calendar-operates').length){
                Biz.closeOpereateList($realTarget);
            }
        },
        /**
         * 事件在此方法中集中绑定和处理；
         */
        initEventHandler: function(){
            var me = this,
                i = 0;
            me.$document.on({
                click: function(e){ return me.documentClick(e, me); },
                mouseover: function(e){ me.documentMouseOver(e, me); },
                mouseout: function(e){ me.documentMouseOut(e, me); },
                mousemove: function(e){ 
                    if (i%3===0) {
                        me.documentMouseMove(e, me); 
                    }
                    i<100 ? i++ : i--;
                },
                mouseup: function(e){ me.documentMouseUp(e, me); },
                mousedown: function(e){ me.documentMouseDown(e, me); },
                keydown: function(e){ me.documentKeyDown(e, me); },
                keyup: function(e){ me.documentKeyUp(e, me); },
                submit: function(e){ me.documentSubmit(e, me); return false;}
            });
            // me.$mainSearchOuter.on({
            //     mouseenter: function(e){
            //         var $me = $(this);
            //         $me.find('.operate').show();
            //     },
            //     mouseleave: function(e){
            //         var $me = $(this);
            //         $me.find('.operate').hide();
            //     }
            // }, '.yy-calendar-search-line');
        },
        /**
         * 根据mid切换到其他用户的日历视图;
         * @param  {[type]} $target [description]
         * @return {[type]}         [description]
         */
        changeToTheUser: function($target){
            if($target.hasClass('actived')) return true;

            var me = this;

            me.setMid($target.attr('mid'), $target.attr('type'));// 设置mid 和 type

            $('.yy-user-item').removeClass('actived');
            $target.addClass('actived');

            // 设置selfid用来设置日程的不同颜色
            if(me.type===2){
                me.setSelfid($target.attr('mid'));
            } else {
                me.setSelfid();
            }
            // me.setCalendarTitle($target);
            // 设置任务和日程的跳转URL；
            // me.setClickTaskUrl();
            me.setShowType(me.initShowType);
            me.activeMode($('#'+me.showType+'Calendar'));
            me.initCalendar();

            return true;
        },
        /**
         * 切换当（天、星期、月），暂时只实现了月;
         * @returns {Boolean}
         */
        changeToToday: function(mode){
            var me = this;
            me.setDay(me.today.timestamp);//将me.month设置为上个月;
            me.showType = mode;
            me.activeMode($('#'+mode+'Calendar'));
            me.openCalendarView(mode);//根据showType的值，切换为相应的日历视图；
            // me.initCalendar();
            return true;
        },
        /**
         * 根据start_time和feed_id在responseData中找出task数据，并将其删除;
         * @param  {[type]} fromid [description]
         * @param  {[type]} type   [description]
         * @param  {[type]} start  [description]
         * @param  {[type]} end    [description]
         * @return {[type]}        [description]
         */
        deleteTaskData: function(fromid, type, start, end){
            var me = this,
                responseData = me.responseData;
            $.each(responseData,function(key,data){
                var time = key.split('-');
                if((start>=time[0]&&start<time[1]) 
                        || (end>time[0]&&end<=time[1])){
                    for(var i=0,len=data.length; i<len; i++)
                        if(typeof data[i]!=='undefined' && data[i][8]==fromid && data[i][9]==type){
                            data.splice(i,1); break;
                        }
                }
            });
        },
        /**
         * 删除关注、共享人员
         * @param  {[type]} $delete_button [description]
         * @return {[type]}                [description]
         */
        deleteUserFromList: function($delete_button) {
            var me = this;

            var $item = $delete_button.closest('.yy-user-item'),
                type = intParse($item.attr('type'));// 类型 1为我关注的 2为共享给我的

            var request_url = '',
                data = {'id': $item.attr('id').split('_')[1]},
                max_height = 205;
            if (type===1) {
                request_url = util.url('/calendar/user/ajaxDel');
                max_height = 205;
            } else if(type===2) {
                request_url = util.url('/calendar/user/ajaxDel/type/2');
                max_height = 205
            } else {
                return;
            }
            util.ajaxApi(request_url, function(flag){
                if (flag) {
                    me.changeToTheUser($('#yySelfItem'));

                    var item_height = $item.outerHeight(),
                        $shower = $item.closest('.scroll-shower'),
                        top_pos = $shower.position().top;
                    top_pos = top_pos+item_height;
                    top_pos = top_pos<0 ? top_pos : 0;
                    $shower.css({'top': top_pos});
                    $item.off().remove();
                    var shower_height = $shower.height()
                    if(!(shower_height>max_height)) {
                        var $container = $shower.closest('.scroll-container'),
                            $scroller  = $container.next('.scroller'),
                            $wrap = $container.parent();
                        $wrap.height($wrap.height()-$container.height()+shower_height);
                        $container.height(shower_height);
                        $scroller.hide();
                    }

                    $.yy.rscallback('删除成功！');
                } else {
                    $.yy.rscallback('删除失败！', 1);
                }
            }, 'POST', 'html', data);
            return false;
        },
        /**
         * 初始化一个SimpleDialog实例
         * @return {[type]} [description]
         */
        initSimpleDialog: function(){
            var me = this;
            // 加载dialog控件；
            util.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
                fn: function(){
                    var $ScheduleEditTemplate = $('#ScheduleEditTemplate'),
                        edit_temp = $ScheduleEditTemplate.html();
                    // 缓存编辑界面模版;
                    me.setCache('ScheduleEditTemplate', edit_temp);
                    me.dialog = new YY.SimpleDialog({
                        'mixObj': edit_temp,
                        'wrapClass': 'calendar-dialog',
                        'title': '创建日程',
                        'width': 600,
                        'height': 255,
                        // 'cache': false,
                        'hasBorder':false,
                        'hasFooter': false,
                        'overlay' : false,
                        'autoOpen': false,
                        'onStart' : function(){
                            // me.closeFloatBox();
                            return true;
                        },
                        'onClose' : function($wrap){
                            me.removeCoverContainer();
                            // me.removeErrorFloatbox();
                            me.removeNoPermissionFloatbox();
                            if(me.timeSelectValue.div!=null){
                                me.timeSelectValue.div.remove();
                                me.timeSelectValue.div = null;
                            }
                            // YY.hash.set(me.getHashBase());
                        }
                    });
                }
            });
            // 加载时间日期选择控件；
            util.loadScript(['yonyou/widgets/dateSelector/dateSelector.js']);
        },
        /**
         * 打开日历的编辑面板;
         * @return {[type]} [description]
         */
        /*
        quickEdit: function(start_time, end_time){
            var me = this,
                dialog = me.dialog;

            dialog.onComplete = function($wrap){
                var $CalendarEditForm = $('#CalendarEditForm', $wrap);
                me.initCalendarEditView($CalendarEditForm, start_time, end_time);  // 初始化日历编辑界面相关内容
                me.bindCalendarEditEvent($CalendarEditForm); // 绑定日历编辑的相关事件
            };
            dialog.setContentData(me.getCache('ScheduleEditTemplate'));
            dialog.resize({'width':600,'height':255});
            dialog.open();
        },*/
        /**
         * 激活日程更新编辑界面；
         * @param  {[type]} schedule_id [description]
         * @param  {[type]} start_time  [description]
         * @param  {[type]} end_time    [description]
         * @return {[type]}             [description]
         */
        /*
        scheduleEditActive: function(schedule_id, start_time, end_time){
            var me = this,
                dialog = me.dialog;

            dialog.setContentData('<img src="'+util.url('js/yonyou/widgets/simpleDialog/ajaxLoader.gif')+'">');//me.getCache('ScheduleEditTemplate')
            dialog.resize({'width':600,'height':475});
            dialog.open();
            var request_url = '/employee/calendar/ajaxEdit',
                request_data = {'scheduleid': schedule_id};
            util.ajaxApi(request_url, function(d, s){
                if (s==='success' && d.rs) {
                    dialog.onComplete = function($wrap){
                        var $CalendarEditForm = $('#CalendarEditForm', $wrap);
                        me.initCalendarEditView($CalendarEditForm, d['data']);  // 初始化日历编辑界面相关内容
                        me.bindCalendarEditEvent($CalendarEditForm, d['data']); // 绑定日历编辑的相关事件
                    };
                    dialog.setContentData(me.getCache('ScheduleEditTemplate'));
                    dialog.open();
                } else {
                    dialog.setContentData(d['error']);
                }
            }, 'POST', 'json', request_data);
        },*/
        /**
         * 格式化时间戳到最近的整点 日期-周-时刻;
         * @return {[type]} [description]
         *//*
        formatDateWeekTime: function(timestamp, type){
            if(!timestamp) return false;
            
            timestamp = typeof timestamp!=='object' ? [timestamp] : timestamp;
            type = type || 1;
            var me = this,
                dateObj = null,
                week_name = me.week_name2,
                year, month, day, week, hour, minute,
                date = [],
                i = 0,
                len = timestamp.length;
            switch(type){
                case 1:
                    dateformat = '{year}-{month}-{day}|{week}|{hour}:{minute}';
                break;
                case 2:
                    dateformat = '{year}年{month}月{day}日|{week}|{hour}点{minute}分';
                break;
            }
            var fix2Length = util.fix2Length,
                temp = '';
            for(; i<len; i++){
                dateObj = me.getDateObj(timestamp[i]);
                hour   = dateObj.getHours();
                minute = dateObj.getMinutes();
                if (minute>30) {
                    hour++;
                    minute = '00';
                } else {
                    minute = minute ? '30' : '00';
                }
                temp = dateformat.replace('{year}', dateObj.getFullYear())
                                .replace('{month}', fix2Length(dateObj.getMonth()+1))
                                .replace('{day}', fix2Length(dateObj.getDate()))
                                .replace('{week}', week_name[dateObj.getDay()])
                                .replace('{hour}', fix2Length(hour))
                                .replace('{minute}', minute);

                temp = temp.split('|');
                date[i] = {'date':temp[0], 'week':temp[1], 'time':temp[2]};
            }
            return date.length===1 ? date[0] : date;
        },*/
        /**
         * 设置日程起止日期;
         * @param {[type]} $timeSelect [description]
         * @param {[type]} start_time  Unix时间戳
         * @param {[type]} end_time    Unix时间戳
         */
        setScheduleDate: function($timeSelect, start_time, end_time){
            var me = this,
                date = YY.date;
            var start = date.formatDateWeekTime(start_time),
                end   = date.formatDateWeekTime(end_time);

            $timeSelect.find('.start .date').val(start['date']);
            $timeSelect.find('.start .week').val(start['week']);
            $timeSelect.find('.start .time').val(start['time']);
            $timeSelect.find('.end .date').val(end['date']);
            $timeSelect.find('.end .week').val(end['week']);
            $timeSelect.find('.end .time').val(end['time']);
        },
        /**
         * 初始化日历编辑界面相关内容;
         * @param  {[type]} $CalendarEditForm [description]
         * @return {[type]}                   [description]
         */
        initCalendarEditView: function($CalendarEditForm, start_time, end_time, scheduleObj){
            var me = this,
                scheduleData = {};
            if (start_time && typeof start_time==='object') {
                scheduleData = start_time;
            } else {
                scheduleData['schedule'] = {};
                scheduleData['schedule']['starttime'] = start_time; // 开始时间
                scheduleData['schedule']['endtime'] = end_time;     // 结束时间
            }

            // 将日程数据应用到日程编辑面板中;
            me.applyData2EditView($CalendarEditForm, scheduleData);

            //设置光标在标题的结尾处;
            var $scheduleTitle = $('.schedule-title', $CalendarEditForm);
            util.setFocusEnd($scheduleTitle[0]);

            var notice_url = '';
            //日程--添加参与人;
            $('[name="notice_partner"]', $CalendarEditForm).yyautocomplete({
                inputName: 'notice_partner',
                appendTo: $('.schedule-partner-block .select-list-container', $CalendarEditForm),
                selAppendTo: $('.schedule-partner-block .selected-list-container', $CalendarEditForm),
                ajaxUrl: notice_url
            });
            //日程--添加知会人;
            $('[name="notice_notifier"]', $CalendarEditForm).yyautocomplete({
                inputName: 'notice_notifier',
                appendTo: $('.schedule-notifier-block .select-list-container', $CalendarEditForm),
                selAppendTo: $('.schedule-notifier-block .selected-list-container', $CalendarEditForm),
                ajaxUrl: notice_url
            });
            // 激活选择人员界面;
            YY.userSelector({
                'selector': $('.add-button', $CalendarEditForm),
                'callback': function(fordiv, data, $selector){
                    if (!($.isArray(data) && data.length)) { return ;}
                    //对所选择的人员信息进行整理
                    var ret = [],
                        $ul = $selector.siblings('.add-input').find('.selected-list-container');
                    for(var i=0,len=data.length; i<len; i++){
                        var addLiId = "yyauto_li_"+data[i]['id'];

                        if($("#"+addLiId).length === 0){
                            //不包含的时候 增加
                            ret.push('<li id="',addLiId,'" class="clearfix fl"><span>', data[i]['name'],
                                    '</span><input type="hidden" name="',fordiv,'_value[]" value=', data[i]['id'],
                                    '><a href="javascript:;" class="close"></a></li>');
                        }
                    }
                    $ul.children(':last').before(ret.join(''));//将选择的人 添加到选择人列表中
                }
            });

            if(util.isIE){
                // 输入框默认文字
                var defaultText = {};
                if($('#calendar_sche [name="title"]').val() == ''){
                    defaultText.sche_title = { txt: '日程主题'};
                }
                if($('#calendar_sche [name="notice_p"]').val() == ''){
                    defaultText.sche_notice_p = { txt: '添加参与人'};
                }
                if($('#calendar_sche [name="notice_n"]').val() == ''){
                    defaultText.sche_notice_n = { txt: '添加知会人'};
                }
                if($('#calendar_sche [name="address"]').val() == ''){
                    defaultText.sche_address = { txt: '地点'};
                }
                $.yy.defaultText(defaultText);
            }
        },
        /**
         * 将日程数据应用到日程界面
         * @param  {[type]} $CalendarEditForm [description]
         * @param  {[type]} scheduleData      [description]
         * @return {[type]}                   [description]
         */
        applyData2EditView: function($CalendarEditForm, scheduleData){
            var me = this,
                scheduleInfo = scheduleData['schedule'],
                partners     = scheduleData['partners'],
                notifiers    = scheduleData['notifiers'];

            // 初始化日期选择相关
            var $timeSelect = $('.yy-time-select', $CalendarEditForm);
            me.setScheduleDate($timeSelect, scheduleInfo['starttime'], scheduleInfo['endtime']);
            if (YY.DateSelector) {
                new YY.DateSelector({
                    wrap : '.yy-time-select', 
                    monthPos: 6,
                    onConfirm: function($dateWrap, $wrap){
                        $wrap.find(':checkbox').removeAttr('checked');
                        return true;
                    }
                });
            }
            // 编辑状态
            if (scheduleInfo['id']) {
                // 将提交地址
                $CalendarEditForm.attr('action', '/employee/calendar/modify')
                    .children('.marked').removeClass('hidden');
                $CalendarEditForm.prepend('<input type="hidden" name="id" value="'+scheduleInfo['id']+'">');

                $('.schedule-title', $CalendarEditForm).val(scheduleInfo['title']);// 标题
                $('[name="address"]', $CalendarEditForm).val(scheduleInfo['address']);// 地址
                $('[name="content"]', $CalendarEditForm).val(scheduleInfo['content']);// 内容
                // 重要程度
                var $scheduleImportant = $('[name="important"]', $CalendarEditForm)
                $scheduleImportant.val(scheduleInfo['isimportant'])
                    .siblings('.select-button').removeClass('selected').eq([scheduleInfo['isimportant']]).addClass('selected');
                // 提醒方式
                if(scheduleInfo['remindway']){
                    var remindway = scheduleInfo['remindway'].toString(),
                        $noticetype = $('[name="noticetype[]"]', $CalendarEditForm);
                    if(remindway.indexOf('1')!==-1){
                        $noticetype.eq(0).attr('checked', 'checked');
                    }
                    if(remindway.indexOf('2')!==-1){
                        $noticetype.eq(1).attr('checked', 'checked');
                    }
                    $('[name="leadtime"]', $CalendarEditForm).val(scheduleInfo['leadtime']);
                }
                // 参与人
                var partners_str = ''; //'<li id="yyauto_li_'+scheduleInfo['creatorid']+'" class="clearfix fl"><span>'+scheduleInfo['name']+'</span><input type="hidden" value="'+scheduleInfo['creatorid']+'" name="notice_partner_value[]"></li>';
                if(partners && typeof partners==='object'){
                    $.each(partners, function(i, user){
                        partners_str += '<li id="yyauto_li_'+user['employeeid']+'" class="clearfix fl"><span>'+user['name']+'</span><input type="hidden" value="'+user['employeeid']+'" name="notice_partner_value[]"><a class="close" href="javascript:;"></a></li>';
                    });
                }
                $('.schedule-partner-block .selected-list-container', $CalendarEditForm).prepend(partners_str);
                // 通知人
                var notifiers_str = '';
                if(notifiers && typeof notifiers==='object'){
                    $.each(notifiers, function(i, user){
                        notifiers_str += '<li id="yyauto_li_'+user['employeeid']+'" class="clearfix fl"><span>'+user['name']+'</span><input type="hidden" value="'+user['employeeid']+'" name="notice_partner_value[]"><a class="close" href="javascript:;"></a></li>';
                    });
                }
                if (notifiers_str) {
                    $('.schedule-notifier-block .selected-list-container', $CalendarEditForm).prepend(notifiers_str);
                }
                // 更改--编辑详情按钮的默认状态
                $('.edit-detail', $CalendarEditForm).removeClass('edit-detail').addClass('edit-quick selected');
                // 更改--保存按钮的默认状态
                $('[type="submit"]', $CalendarEditForm).removeClass('disabled').val('保 存');
            }
        },
        /**
         * 绑定日历编辑的相关事件；
         * @return {[type]} [description]
         */
        bindCalendarEditEvent: function($CalendarEditForm, scheduleObj){
            var me = this,
                dialog = me.dialog;

            var start_time_cache = '',
                end_time_cache = '';
            $CalendarEditForm.on({
                'click':function(e){
                    var $target = $(e.target)
                        $realTarget = null;

                    // 重要程度选择;
                    if ($target.is('.schedule-normal')) {
                        $target.addClass('selected').siblings().removeClass('selected');
                        $('[name="important"]', $CalendarEditForm).val('0');
                    } else if ($target.is('.schedule-important')) {
                        $target.addClass('selected').siblings().removeClass('selected');
                        $('[name="important"]', $CalendarEditForm).val('1');
                    }
                    // 选择全天
                    else if ($target.is('[name="allday"]')) {
                        var $timeSelect = $target.closest('.yy-time-select');
                        if ($target.is(':checked')) {
                            var startdate = $timeSelect.find('[name="start_date"]').val().split('-'),
                                starttime = $timeSelect.find('[name="start_time"]').val().split(':'),
                                enddate = $timeSelect.find('[name="end_date"]').val().split('-'),
                                endtime = $timeSelect.find('[name="end_time"]').val().split(':');
                            start_time_cache = (new Date(startdate[0], (startdate[1]-1), startdate[2], starttime[0], starttime[1], '00')).getTime()/1000;
                            end_time_cache   = (new Date(enddate[0], (enddate[1]-1), enddate[2], endtime[0], endtime[1], '00')).getTime()/1000;

                            var start_time = (new Date(startdate[1]+'/'+startdate[2]+'/'+startdate[0])).getTime()/1000,
                                end_time = start_time+me.oneday;

                            me.setScheduleDate($timeSelect, start_time, end_time);
                        } else {
                            // util.trace(start_time_cache)
                            me.setScheduleDate($timeSelect, start_time_cache, end_time_cache);
                        }
                    }
                    // 快速和详细编辑切换;
                    else if ($target.is('.edit-detail')) {
                        me.dialog.resize({'width':720,'height':me.$window.height()});//475
                        $target.removeClass('edit-detail').addClass('edit-quick selected');
                        $CalendarEditForm.children('.marked').removeClass('hidden');
                    }
                    else if ($target.is('.edit-quick')) {
                        me.dialog.resize({'width':720,'height':255});
                        $target.removeClass('edit-quick selected').addClass('edit-detail');
                        $CalendarEditForm.children('.marked').addClass('hidden');
                    }
                    // 添加参与人知会人框框内的事件
                    else if($target.closest('.add-member-table').length){
                        if (($realTarget = $target.closest('.add-input')).length) {
                            // 删除已经添加的人员;
                            if ($target.is('.close')) {
                                $target.closest('.li').remove();
                            }
                            $realTarget.find(':text').focus();
                        } else if (($realTarget = $target.closest('.add-button')).length) {
                            // 弹出人员添加框：
                        }
                    }
                    // 取消
                    else if ($target.is('.cancel')) {
                        dialog.close();
                    }
                },
                'keyup': function(e){
                    var $me = $(this),
                        $target = $(e.target);

                    if ($target.is('[name="title"]')) {
                        formValid($me);
                    }
                },
                'submit': function(){
                    var $me = $(this);

                    if (!$me.find('input[type="submit"]').is('.disabled')) {
                        // 编辑
                        if(scheduleObj){
                            formValid($me) && me.saveForm($me, function(){
                                // 编辑成功之后，删除旧的数据;
                                me.deleteTaskData(scheduleObj['schedule']['id'], '25', scheduleObj['schedule']['starttime'], scheduleObj['schedule']['endtime']);
                            });
                        }
                        // 创建
                        else {
                            formValid($me) && me.saveForm($me);
                        }
                    } else {
                        $.yy.rscallback('请输入正确信息！', 1);
                    }
                    
                    return false;
                }
            });
            /**
             * 表单验证;
             * @param  {[type]} $me [description]
             * @return {[type]}     [description]
             */
            function formValid($form) {
                var title_flag = titleValid($form.find('input[name="title"]')),
                    $submit = $form.find('input[type="submit"]');

                title_flag && !$submit.is('.submiting')
                    ? $submit.removeClass('disabled') //.removeAttr('disabled')
                    : $submit.addClass('disabled');//.attr('disabled','disabled')
                
                return title_flag;
            }
            /**
             * 验证标题;
             * @return {[type]} [description]
             */
            function titleValid($title) {
                return $.trim($title.val()) ? true : false;
            }
        },
        /**
         * 保存日程;
         */
        saveForm: function($form, callback){
            var me = this,
                mid = me.mid,
                options = {
                    beforeSubmit: beforeSubmitHandle,
                    success: scheduleSaveSuccess
                };
            $form.ajaxSubmit(options);
            /**
             * task保存成功;
             */
            function scheduleSaveSuccess(responseText, statusText, xhr, $form){
                var responseObj = null,
                    taskData = null,
                    responseData = null;
                if(statusText==='success'){
                    try{
                        responseObj = $.parseJSON(responseText);
                        if(responseObj.rs===false){
                            $.yy.rscallback(responseObj['error']);
                            // YY.util.trace(responseObj['error']);
                        } else {//保存成功，将返回的data值插入到已经存在的数据集中;
                            typeof callback === 'function' && callback();
                            taskData = responseObj.data[0];
                            responseData = me.responseData;
                            $.each(responseData,function(key,taskDatas){
                                var time = key.split('-');
                                if((taskData[2]>=time[0]&&taskData[2]<time[1]) //task的开始日期在数据集之内;
                                        || (taskData[3]>time[0]&&taskData[3]<=time[1])){//task的结束时间在数据集之内;
                                    taskDatas.push(taskData);
                                    taskDatas.sort(function(a,b){
                                        return me.sortTaskData(a, b);
                                    });
                                }
                            });
                            //数据保存成功，刷新日历界面;
                            me.refreshCalendar();
                            $.yy.rscallback('恭喜你保存成功！');
                        }
                    }catch(err){
                        $.yy.rscallback('系统错误！', 1);
                        util.trace('error');
                    }
                    // me.closeFloatBox();
                    // me.closeCreatePanel();
                    YY.hash.set(me.getHashBase());
                    me.dialog.close();
                }
            }
            /**
             * submit之前的一些处理;
             */
            function beforeSubmitHandle(formData, jqForm, options){
                // 如果不是自己的日历，就不允许创建日程或者任务;
                if(mid){
                    $.yy.rscallback('您没有在此日历创建日程的权限！');
                    // me.closeFloatBox();
                    // me.closeCreatePanel();
                    return false;
                }
                jqForm.find('input[type="submit"]').addClass('disabled submiting').val('发布中...');// 防止重复提交;
                // this.url = jqForm.attr('action')+'?ajaxsubmit=1';//增加ajaxsubmit参数，表示是以ajax方式发送的表单保存数据;
                return true;
            }
            
            return false;
        },
        /**
         * 设置日历的缓存数据;
         * @param {[type]} key [description]
         * @param {[type]} val [description]
         */
        setCache: function(key, val){
            var me = this;

            me.calendarCache = me.calendarCache || {};

            me.calendarCache[key] = val;
        },
        /**
         * 获取已有的缓存;
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        getCache: function(key){
            var me = this,
                ret = '';

            me.calendarCache = me.calendarCache || {};

            if (typeof me.calendarCache[key] !== 'undefined') {
                ret = me.calendarCache[key];
            }

            return ret;
        },
        /**
         * 删除缓存数据;
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        deleteCache: function(key){
            var me = this;

            me.calendarCache = me.calendarCache || {};

            if (typeof me.calendarCache[key] !== 'undefined') {
                delete me.calendarCache[key];
            }
        }
    };
    // Calendar END

}(jQuery, YY, YY.util));

// taskData[0]: ID
// taskData[1]: 名称
// taskData[2]: 起始时间
// taskData[3]: 结束时间
// taskData[4]: 圈子id
// taskData[5]: 用户id，menber_id
// taskData[6]: 起始时刻    *
// taskData[7]: 结束时刻    *
// taskData[8]: fromid
// taskData[9]: 任务类型，25为任务，35为日程（决定task条的显示颜色）
// taskData[10]: 创建时间       *
// taskData[11]: feedid        *
// taskData[12]: day（无用数据） *
// taskData[13]: 持续的天数      *
// taskData[14]: isHour（是否为跨天日程，为true就是非跨天日程，false为跨天日程）
// taskData[15]: isSelf（表示是否为自己的日历）*此参数已经去除