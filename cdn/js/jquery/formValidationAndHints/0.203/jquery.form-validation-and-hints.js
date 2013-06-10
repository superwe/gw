/*
 *	jquery.form-validation-and-hints.js
 *	2009-2012, keikendo.com 
 *	Licensed under GPL license (http://www.opensource.org/licenses/gpl-license.php).
 *	@version 0.203
 *
 * http://www.keikendo.com/form-validation-and-hints/
 *  
 */


/* --- TO SET --- */
// Prefix used to hook CSS classes to the script 
classprefix = 'verify'; // <input class="verifyInteger" type="text" name="mail" />

// Set your validation rules 
function isTypeValidExt( input, classprefix, type, value ) {
	/* RULE EXAMPLE (Accept only integer values)
	if( type == classprefix + 'Integer' ) {
		return ( ( value.match(/^[\d|,|\.|\s]*$/) ) && ( value != '' ) );
	} 
	*/
	return true;
}







/* --- DOCUMENT READY --- */
$(document).ready(function(){
	mustCheck = true;

	$("."+classprefix+"Cancel").click(function(event){
		mustCheck = false;
	});
	
	// HINTS: Add *title hints to form elements
	for( var i=0; i < document.forms.length; i++) {
		var fe = document.forms[i].elements;	
		for ( var j=0; j < fe.length; j++ ) {
			if( (fe[j]).title.indexOf("**")==0 ) {
				if( (fe[j]).value == "" || (fe[j]).value == titleHint ) {
					var titleHint = (fe[j]).title.substring(2);
					(fe[j]).value = titleHint;
				}
			} else if( ( (fe[j]).type == "text" || (fe[j]).type == "password" || (fe[j]).tagName == 'TEXTAREA' ) && (fe[j]).title.indexOf("*")==0 ) {
				addHint( (fe[j]) );
				$(fe[j]).blur(function(event){ addHint(this); });
				$(fe[j]).focus(function(event){ removeHint(this); });
			}
		}
	}

	// VALIDATION:
	$("FORM").submit(function(event){
		if(mustCheck) {
			// Prevent submit if validation fails
			if( !checkForm(this) ) {
				event.preventDefault();
			};
		} else {
			mustCheck = !mustCheck;
		}
	});
}); // end jQuery $(document).ready



/* --- FUNCTIONS --- */
function addHint(field) {
	var titleHint = field.title.substring(1);
	if( field.value == "" || field.value == titleHint ) {
			//in "password" inputs, set to "text" to show hint, preserve type in class attribute
			if( field.type == "password" ) {
				$( field ).addClass("password");
				var newObject = changeInputType( field, "text" )//returns false for non-ie
				if(document.all){ // if IE
					field = newObject;
				}
			} //end type == "password"
			$(field).addClass("hint");
			field.value = titleHint;
	} //end value==""
} //end addHint


function removeHint(field) { //only on INPUT.text items 
		var titleHint = field.title.substring(1);
		if( field.value == "" || field.value == titleHint ) {
			$(field).removeClass('hint');
			field.value="";
			//re-set password type if appropiate
			if($(field).hasClass("password")) {
				var newObject = changeInputType( field, "password" ); //returns false for non-ie
				if(newObject) { ///IE, element was replaced: reset focus
					$(newObject).focus();
					$(newObject).select();
				}
			}//end hasClass("password")
		}//end value == titleHint
	//}//end what.title	
}//end rmhint


function changeInputType(oldObject, oType) {
//based on http://arjansnaterse.nl/changing-type-attribute-in-ie
//used to simulate change of INPUT type in IE
	if(!document.all){
		oldObject.type = oType;
		return false;
	}else{
	//ie can't change INPUT's type, must create new element
	  var newObject = document.createElement('input');	  
	  newObject.type = oType;
	  if(oldObject.size) newObject.size = oldObject.size;
	  if(oldObject.title) newObject.title = oldObject.title;
	  if(oldObject.value) newObject.value = oldObject.value;
	  if(oldObject.name) newObject.name = oldObject.name;
	  if(oldObject.id) newObject.id = oldObject.id;
	  if(oldObject.className) newObject.className = oldObject.className;
	  oldObject.parentNode.replaceChild(newObject,oldObject);
	  //live()
	  //newObject.blur = oldObject.blur;
	  //newObject.focus = oldObject.focus;
		//$(newObject).blur(function(event){ addHint(this); });
		//$(newObject).focus(function(event){ removeHint(this); });
	  return newObject;
  }//end document.all
}

function checkForm(form) {
	var send = true;
	var password = '';
	radioGroups = Array();
	checkboxGroups = Array();

	$( form ).removeClass ( "haserrors" );

	//inputs = $(form).find('INPUT[class*="' + classprefix + '"]');
	inputs = $(form).find('INPUT[class*="' + classprefix + '"]:visible, .required INPUT:visible, .required TEXTAREA:visible, .required SELECT:visible');
	
	$.each(inputs, function(i, val) {  
     	input = $(val);
     	if( input.attr('offsetWidth') != 0 ) {

			// Fix for JQuery 1.6
			var tag = input.get(0).tagName;
			var inputType = '';
			if( tag == 'INPUT' ) {
					inputType = input.attr('type');
			} else if( tag == 'SELECT' ) {
					inputType = 'select-one';
			} else if( tag == 'TEXTAREA' ) {
					inputType = 'textarea';					
			}

			switch(inputType) {

				case 'select-one':
					if( input.val() == '') {
						if( send ) moveTo(input);
						showErrorOn( input );
						send = false;
					}
				break;

				case 'select-multiple':
					if( input.get(0)[ input.attr('selectedIndex') ].value == '') {
						if( send ) moveTo(input);
						showErrorOn( input );
						send = false;
					}
				break;
				
				case 'radio':
					if( window.radioGroups[ input.attr('name') ] === undefined ) {
						radioGroups[input.attr('name')] = new Array();
					}
					radioGroups[input.attr('name')][ radioGroups[ input.attr('name') ].length ] = input;
				break;

				case 'checkbox':
					if( window.checkboxGroups[ input.attr('name') ] === undefined ) {
						checkboxGroups[input.attr('name')] = new Array();
					}
					checkboxGroups[input.attr('name')][ checkboxGroups[ input.attr('name') ].length ] = input;
				break;
				
				case 'file':
					if( !isFilled(input) ) {
						if( send ) moveTo(input);
						showErrorOn( input );
						send = false;
					}
				break;

				case 'password':
					if( input.hasClass( classprefix + 'PasswordConfirm' ) ) {
						if( input.val() != password ) {
							if( send ) moveTo(input);
							showErrorOn( input );
							send = false;
						}
						break;
					} else {
						password = input.val();
					}

				case 'textarea':
				case 'text':
					var isFieldValid = isValid(input); // si hay una funcion de validez, la ejecutamos, lo cual nos podra afectar el value del campo en caso de requerir filtrado
					var fieldOK = true;
					if ( isRequired(input) && !isFieldValid ){ fieldOK = false; }
					if ( isFilled(input) && !isFieldValid  ){ fieldOK = false; }

					if( !fieldOK ){ 
						//if( isFilled(input) || isRequired(input) ) && ( !isFieldValid ) ) {
						if( send ) moveTo(input);
						showErrorOn( input );
						send = false;
					}
				break;

				default:
				break;
			}
		}		
    });
	for ( var i in radioGroups ) {
		for ( var j in radioGroups[i] ) {
			if( radioGroups[i][j].attr('checked') ) {
				if(radioGroups[i][j].val() !== '') {
					rmErrorClass( radioGroups[i][j] );
				} else {
					showErrorOn( radioGroups[i][j] );
					send = false;
				}
				break;
			}
		}
		if( !radioGroups[i][j].attr('checked') ) {
			for ( var j in radioGroups[i] ) {
				if( send && j==0 ) moveTo( radioGroups[i][j] );
				showErrorOn( radioGroups[i][j] );
			}
			send = false;
		}
	}
	for ( var i in checkboxGroups ) {
		for ( var j in checkboxGroups[i] ) {
			if( checkboxGroups[i][j].attr('checked') ) {
				rmErrorClass( radioGroups[i][j] );
				break;
			}
		}
		if( !checkboxGroups[i][j].attr('checked') ) {
			for ( var j in checkboxGroups[i] ) {
				if( send && j==0 ) moveTo( checkboxGroups[i][j] );
				showErrorOn( checkboxGroups[i][j] );
			}
			send = false;
		}
	} 
	
	// Add class haserrors to each row that has at least one field with errors.
	var rows = $(form).find('DIV.row');
	$.each(rows, function(i, val) {
     	var row = $(val);
     	rowHasErrors(row);
	});

	return send;
}

function rowHasErrors(row) {
	var haserrors = $(row).find('.error');
	if( haserrors.length > 0 ) {
		$(row).addClass('haserrors');
		return true;
	}
	$(row).removeClass('haserrors');
	return false;
}

function isRequired(input) {
	return input.parents( ".required" ).length != 0;
}

function isFilled(input) {
	hintText = '';
	if(typeof(input.attr('title')) !== 'undefined') {
		//clear HINTs before validation
		if( input.attr('title').indexOf("**")==0) {
			var hintText = input.attr('title').substring(2);
		} else if( input.attr('title').indexOf("*")==0) {
			var hintText = input.attr('title').substring(1);
		}//end clear hints
		return input.val() != hintText && input.val() != '' ;
	} 
	return input.val();
}

function isValid( input ) {
	if( !isFilled(input) ) return false;
	string = input.attr('class');
	value = input.val();
	start = string.indexOf(classprefix);
	type = '';
	result = true;
	while(result) {
		if( 
			start == -1 || 
			string.charAt( (start+classprefix.length) ) == ' ' || 
			string.charAt( (start+classprefix.length) ) != string.charAt( (start+classprefix.length) ).toUpperCase() 
		) {	
			break;
		} else {
			for( i=start; i < string.length; i++ ) {
				if(string.charAt(i) == ' ') {
					break;
				}
				type += string.charAt(i);
			}
			if( !isTypeValid( input, type, value ) ) {
				result = false;
				break;
			}
			start = string.indexOf(classprefix,start+1);
		}
	}
	return result;
}

function isTypeValid( input, type, value ) {

	if( type == classprefix + 'Text' ) {
		return true;
	}
	
	if( type == classprefix + 'Integer' ) {
		return ( ( value.match(/^[\d|,|\.|\s]*$/) ) && ( value != '' ) );
	}
	
	if( type == classprefix + 'Url' ) {
		return ( value.match( /^(https?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/ ) );
	}
	
	if( type == classprefix + 'MultipleWords' ) {
		return value.match(/^.*[^^]\s[^$].*$/);
	}
	
	if( type == classprefix + 'Mail' ) {
		if( value.indexOf("@example.com")>-1){return false;};
		var emailFilter=/^.+@.+\..{2,}$/;
		//var emailFilter=/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/;
		var illegalChars= /[\(\)\<\>\,\;\:\\\/\"\[\]]/;
		if(!(emailFilter.test(value))||value.match(illegalChars)){return(false);}else{return (true);}
		return false;
	}

	if(typeof isTypeValidExt == 'function') {
		fr = isTypeValidExt( input, classprefix, type, value );
		if( isTypeValidExt( input, classprefix, type, value ) === null ) {
			return false;
		} else {
			return fr;
		}
	}
	return true;
}

function moveTo( input ) {
	var targetOffset = input.offset().top - 40;
	$('html,body').animate({scrollTop: targetOffset}, 200 );
	if( !$.browser.msie ) {
		input.get(0).focus();
	}
}

function showErrorOn( input ) {
/* BUG FIXED FOR IE: when submited it auto focuses to the first required field, so the hint and red box aren't there. Might be confusing to a user!

	input.bind('focus.rmErrorClass', function(){
		rmErrorClass( this );
	});
*/
	input.bind('mousedown.rmErrorClass', function(){
		rmErrorClass( this );
	});
	input.bind('keydown.rmErrorClass', function(){
		rmErrorClass( this );
	});	
	input.bind('change.rmErrorClass', function(){
		rmErrorClass( this );
	});	
	input.bind('focus.rmErrorClass', function(){
		rmErrorClass( this );
	});	
	input.bind('blur.rmErrorClass', function(){
		rmErrorClass( this );
	});	
	input.addClass( "error" );
	input.closest( ".required, .field" ).addClass( "error" );
}

function rmErrorClass( elm ) {
	var etag=$(elm).parents(".error");
	var eform = $(elm).parents( 'FORM' );
	$(elm).removeClass("error");
	$(elm).unbind('.rmErrorClass'); //no further clicks will trigger rmErrorClass();
	if(etag){ $(etag).removeClass( "error" ); };
	var row = $(elm).closest('.row.haserrors');
	rowHasErrors(row);
}

