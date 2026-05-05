<?php
defined('MOODLE_INTERNAL') || die();

$functions = [

    'mod_eseecode_save_draft' => [
        'classname'   => 'mod_eseecode\external\save_draft',
        'methodname'  => 'execute',
        'description' => 'Save the student\'s current code as a draft.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities'=> 'mod/eseecode:submit',
    ],

    'mod_eseecode_submit_code' => [
        'classname'   => 'mod_eseecode\external\submit_code',
        'methodname'  => 'execute',
        'description' => 'Submit the student\'s code as a final submission.',
        'type'        => 'write',
        'ajax'        => true,
        'capabilities'=> 'mod/eseecode:submit',
    ],

];
