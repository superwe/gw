<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Oauth extends CI_Controller {
		
	/**
	 * __construct function.
	 * 
	 * @access public
	 */
	function __construct() {
		parent::__construct();
		$this->load->library('oauth_server');
	}
	
	
	/**
     * 接口验证获取令牌
     * @return 	json
     */
	function index() {
		// 参数定义
		$params = array();
		
		// Client id
		if ($client_id = $this->input->get('client_id')) {
			$params['client_id'] = trim($client_id);
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See client_id.', NULL, array(), 400);
		}

		// Client secret
		if ($client_secret = $this->input->get('client_secret')) {
			$params['client_secret'] = trim($client_secret);
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See client_secret.', NULL, array(), 400, 'json');
			return;
		}
				
		// Client redirect uri
		if ($redirect_uri = $this->input->get('redirect_uri')) {
			$params['redirect_uri'] = trim($redirect_uri);
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See redirect_uri.', NULL, array(), 400);
			return;
		}

		// 验证response type
		if ($response_type = $this->input->get('response_type')) {
			$response_type = trim($response_type);
			$valid_response_types = array('code'); // array to allow for future expansion

			if ( ! in_array($response_type, $valid_response_types)) {
				$this->_fail('unsupported_response_type', 'The authorization server does not support obtaining an authorization code using this method. Supported response types are \'' . implode('\' or ', $valid_response_types) . '\'.', $params['redirect_uri'], array(), 400);
				return;
			} else {
				$params['response_type'] = $response_type;
			}
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See response_type.', NULL, array(), 400);
			return;
		}
		
		if ($username = $this->input->get('username')) {
			$username = trim($username);
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See username.', NULL, array(), 400);
			return;
		}
		
		if ($password = $this->input->get('password')) {
			$password = trim($password);
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See password.', NULL, array(), 400);
			return;
		}
		//验证用户
		$user = $this->oauth_server->validate_user($username, $password);		
		if ($user == FALSE) {
			$this->_fail('invalid_request', 'Invalid username and/or password', NULL, array(), 400, 'json');
			return;
		} else {
			$params['user'] = array(
					'user_id' => $user->id,
					'user_name' => $user->name,
					'user_email' => $user->email,
					'non_ad_user' => TRUE
			);
		}
		
		// 验证 client_id 和client_secret
		$client_details = $this->oauth_server->validate_client($params['client_id'], $params['client_secret']); // returns object or FALSE
		if ($client_details === FALSE) {
			$this->_fail('unauthorized_client', 'The client is not authorized to request an authorization code using this method', NULL, array(), 403, 'json');
			return;
		}
		
		// 获得可用的 scope
		if ($scope_string = $this->input->get('scope')) {
			$scopes = explode(',', $scope_string);
			$params['scope'] = $scopes;
		} else {
			$params['scope'] = array();
		}
		
		// 检查 scope是否可用
		if (count($params['scope']) > 0) {
			foreach($params['scope'] as $s) {
				$exists = $this->oauth_server->scope_exists($s);
				if ( ! $exists) {
					$this->_fail('invalid_scope', 'The requested scope is invalid, unknown, or malformed. See scope \''.$s.'\'.', NULL, array(), 400);
					return;
				}
			}
		} else {
			$this->_fail('invalid_request', 'The request is missing a required parameter, includes an invalid parameter value, or is otherwise malformed. See scope.', NULL, array(), 400);
			return;
		}
		
		// 获取 scope
		if ($state = $this->input->get('state')) {
			$params['state'] = trim($state);
		} else {
			$params['state'] = '';
		}
		//var_dump($params);exit();
		//验证
		$authorised = $this->oauth_server->access_token_exists($params['user']['user_id'], $params['client_id']);
		if ($authorised) {
			$match = $this->oauth_server->validate_access_token($authorised->access_token, $params['scope']);
			if(!$match){
				$this->_fail('invalid_request', 'The access token is invalid in scope.', NULL, array(), 403, 'json');
			}
		} 
		$params['code'] = $this->oauth_server->new_auth_code($params['client_id'], $params['user']['user_id'], $params['redirect_uri'], $params['scope'], $authorised->access_token);
		$session = $this->oauth_server->validate_auth_code($params['code'], $params['client_id'], $params['redirect_uri']);
		if ($session === FALSE) {
			$this->_fail('invalid_request', 'The authorization code is invalid.', NULL, array(), 403, 'json');
		}
	
		// 生成新的access_token， 并且删除验证的 code
		$access_token = $this->oauth_server->get_access_token($session->id);
				
		//返回access_token和其他参数
		$this->_response(array('access_token' => $access_token));
	}
	
	/**
	 * Show an error message
	 * 
	 * @access private
	 * @param mixed $msg
	 * @return string
	 */
	
	private function _fail($error, $description, $url = NULL, $params = array(), $status = 400, $output = 'html') {
		if ($url) {
			$error_params = array(
				'error' . $error,
				'error_description' . urlencode($description)
			);
						
			$params = array_merge($params, $error_params);
			
			$this->oauth_server->redirect_uri($url, $params);

		} else {
			switch ($output) {
				case 'html':
				default:
					show_error('[OAuth error: ' . $error . '] ' . $description, $status);
				break;
				case 'json':
					$this->output->set_status_header($status);
					$this->output->set_output(json_encode(array(
						'error'			=>	1,
						'error_description'	=>	'[OAuth error: ' . $error . '] ' . $description,
						'access_token'	=>	NULL
					)));
				break;
			}
		}
	}
	
	
	/**
	 * JSON response
	 * 
	 * @access private
	 * @param mixed $msg
	 * @return string
	 */
	private function _response($msg) {
		$msg['error'] = 0;
		$msg['error_description'] = '';
		$this->output->set_status_header('200');
		$this->output->set_header('Content-type: application/json');
		$this->output->set_output(json_encode($msg));	
	}

}