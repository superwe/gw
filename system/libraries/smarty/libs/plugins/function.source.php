<?php
/**
 * Smarty plugin
 *
 * @package Smarty
 * @subpackage PluginsFunction
 */

/**
 * Smarty {cycle} function plugin
 *
 * Type:     function<br>
 * Name:     cycle<br>
 * Date:     May 3, 2002<br>
 * Purpose:  cycle through given values<br>
 * Params:
 * <pre>
 * - name      - name of cycle (optional)
 * - values    - comma separated list of values to cycle, or an array of values to cycle
 *               (this can be left out for subsequent calls)
 * - reset     - boolean - resets given var to true
 * - print     - boolean - print var or not. default is true
 * - advance   - boolean - whether or not to advance the cycle
 * - delimiter - the value delimiter, default is ","
 * - assign    - boolean, assigns to template var instead of printed.
 * </pre>
 * Examples:<br>
 * <pre>
 * {cycle values="#eeeeee,#d0d0d0d"}
 * {cycle name=row values="one,two,three" reset=true}
 * {cycle name=row}
 * </pre>
 *
 * @link http://www.smarty.net/manual/en/language.function.cycle.php {cycle}
 *       (Smarty online manual)
 * @author Monte Ohrt <monte at ohrt dot com>
 * @author credit to Mark Priatel <mpriatel@rogers.com>
 * @author credit to Gerard <gerard@interfold.com>
 * @author credit to Jason Sweat <jsweat_php@yahoo.com>
 * @version  1.3
 * @param array                    $params   parameters
 * @param Smarty_Internal_Template $template template object
 * @return string|null
 */

function smarty_function_source($params, $template)
{
    static $sourceUrl;
    if(null === $sourceUrl){
        $ci = $template->getTemplateVars('ci');
        $sourceUrl = $ci->config->item('source_url');
    }
    $path = $params['path'];
    if(substr($path, 0, 1) != '/') $path = '/' . $path;
    return $sourceUrl .  $path;
}

?>