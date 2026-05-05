<?php
require_once('../../config.php');

$id = required_param('id', PARAM_INT); // Course id

$course = $DB->get_record('course', ['id' => $id], '*', MUST_EXIST);

require_login($course);
$PAGE->set_url('/mod/eseecode/index.php', ['id' => $id]);
$PAGE->set_title($course->shortname . ': ' . get_string('modulenameplural', 'mod_eseecode'));
$PAGE->set_heading($course->fullname);

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('modulenameplural', 'mod_eseecode'));

$cms = get_coursemodules_in_course('eseecode', $course->id, 'm.name, m.intro, m.introformat');

if (empty($cms)) {
    notice(get_string('thereareno', 'moodle', get_string('modulenameplural', 'mod_eseecode')), "$CFG->wwwroot/course/view.php?id=$course->id");
}

$table = new html_table();
$table->attributes['class'] = 'generaltable mod_index';
$table->head  = [get_string('name'), get_string('description')];
$table->align = ['left', 'left'];

foreach ($cms as $cm) {
    $link = html_writer::link(
        new moodle_url('/mod/eseecode/view.php', ['id' => $cm->id]),
        format_string($cm->name)
    );
    $intro = format_module_intro('eseecode', $cm, $cm->id, false);
    $table->data[] = [$link, $intro];
}

echo html_writer::table($table);
echo $OUTPUT->footer();
