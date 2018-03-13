/*
 * @Author: Jackson 
 * @Date: 2018-03-13 17:13:44 
 * @Last Modified by: Jackson
 * @Last Modified time: 2018-03-13 23:21:45
 */

(function(global, factory) {
    "use strict";
    if (typeof module === "object" && typeof module.exports === "object") {

        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error("this module requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
    // Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {

    var tmpl = {};

    function isObject(obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
    }

    tmpl.render = function(data, template, cb) {

        if (!data || !isObject(data)) {
            err('Data should be a Object');
            // data error,excute callback function
            return cb();
        }

        // 标签格式
        var tags = {
            start: '{{',
            end: '}}',
            loopStart: '{{for Variable name}}',
            loopEnd: '{{/for}}',
            conditionSt: '{{if Variable name}}',
            conditionEnd: '{{/if}}'
        }

        // 编译阶段  转换字符串
        template = tmpl.compile(template);
        template = `push("` + template + `");`;

        var script =
            `
            (function parser(){
                var output = "";
                function push(str){
                    output += str;
                }
            ` + template + `
                return output;
            })
            `

        script = script.replace(/[\f\n\r\t\v]*/g, '');
        var parser = eval(script);
        var final_str = '';
        data = tmpl.dataFilter(data)
        try {
            final_str = parser.call(data);
        } catch (e) {
            err('syntax error!');
            return '';
        }
        return final_str;

    }
    tmpl.compile = function(str) {
        return str.replace(/\{\{\s*for \s*([\w|_|.\[\]]+)\s*\}\}/gm,
            `"); \n for(let i = 0; i< $1.length; i++){ \n push("`
        ).replace(/{{\s*\/for\s*}}/gm,
            `"); \n } \n push("`
        ).replace(/{{\s*if ([\w|_|.\[\]]+)\s*}}/gm,
            `"); \n if($1){ \n push("`
        ).replace(/{{\s*\/if\s*}}/gm,
            `"); \n } \n push("`
        ).replace(/{{\s*([\w|_|.\[\]]+)\s*}}/gm,
            `"); \n push($1); \n push("`
        )
    }

    // 防止XSS攻击 对数据先做标签过滤
    tmpl.dataFilter = function(data) {
        try {
            var json = JSON.stringify(data);
        } catch (e) {
            alert('error:data is illegal');
            err(e);
            return {};
        }
        json = json.replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&/g, '&amp;')
            .replace(/\//g, '&#x2f;');
        // .replace(/"/g, '&quot;')
        // .replace(/'/g, '&#x27;');

        return JSON.parse(json);
    }

    /**
     * 错误处理函数
     * @param {string} text 
     */
    function err(text) {
        text = text ? text : 'something error: params are unsuitable';
        console.log(text);
    }

    window.tmpl = tmpl;

    return tmpl;

});