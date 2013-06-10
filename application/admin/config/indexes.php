<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 索引引擎配置
 * User:	bishenghua
 * Date:	13-4-17
 * Time:	上午9:07
 * Email:	net.bsh@gmail.com
 */

//支持elasticsearch集群
$config['es_server'][0]['host'] = '192.168.52.55'; //地址
$config['es_server'][0]['port'] = '9200'; //端口

/**
 * 生成结构

curl -XPUT http://localhost:9200/qiater
curl -XPOST http://localhost:9200/qiater/member/_mapping -d'
{
    "member": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/speech/_mapping -d'
{
    "speech": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/group/_mapping -d'
{
    "group": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/files/_mapping -d'
{
    "files": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/topic/_mapping -d'
{
    "topic": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/vote/_mapping -d'
{
    "vote": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/schedule/_mapping -d'
{
    "schedule": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/task/_mapping -d'
{
    "task": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
curl -XPOST http://localhost:9200/qiater/announce/_mapping -d'
{
    "announce": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
		     "spaceid" : {"type" : "integer", "index" : "not_analyzed"},
		     "employeeid" : {"type" : "integer", "index" : "not_analyzed"},
		     "url" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "date" : {"type" : "string", "index" : "not_analyzed", "null_value" : ""},
		     "title" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""},
	         "content" : {"type" : "string", "store": "no", "term_vector": "with_positions_offsets", "indexAnalyzer": "ik", "searchAnalyzer": "ik", "include_in_all": "true", "boost": 8, "null_value" : ""}
        }
    }
}'
 */