<?php
require_once('../../config.php');
require_once($CFG->dirroot . '/mod/eseecode/locallib.php');

$id = required_param('id', PARAM_INT); // Course module id

[$course, $cm] = get_course_and_cm_from_cmid($id, 'eseecode');
$eseecode = $DB->get_record('eseecode', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/eseecode:viewsubmissions', $context);

$PAGE->set_url('/mod/eseecode/submissions.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($eseecode->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

// Retrieve all students enrolled with submit capability.
$students = get_enrolled_users($context, 'mod/eseecode:submit');

// Retrieve all existing submissions, keyed by userid for quick lookup.
$submissionsByUser = [];
foreach (eseecode_get_all_submissions($eseecode->id) as $sub) {
    $submissionsByUser[$sub->userid] = $sub;
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('submissionsfor', 'mod_eseecode', format_string($eseecode->name)));

$viewurl = new moodle_url('/mod/eseecode/view.php', ['id' => $cm->id]);
echo html_writer::div(
    html_writer::link($viewurl, '&larr; ' . get_string('modulename', 'mod_eseecode'), ['class' => 'btn btn-outline-secondary btn-sm mb-3']),
    'mb-3'
);

if (empty($students)) {
    echo $OUTPUT->notification(get_string('nostudents', 'mod_eseecode'), \core\output\notification::NOTIFY_INFO);
    echo $OUTPUT->footer();
    exit;
}

echo html_writer::start_tag('table', ['class' => 'table table-bordered table-hover generaltable']);
echo html_writer::start_tag('thead');
echo html_writer::start_tag('tr');
echo html_writer::tag('th', get_string('student', 'mod_eseecode'));
echo html_writer::tag('th', get_string('status', 'mod_eseecode'));
echo html_writer::tag('th', get_string('lastmodified', 'mod_eseecode'));
echo html_writer::tag('th', get_string('code', 'moodle') ?: 'Code');
echo html_writer::end_tag('tr');
echo html_writer::end_tag('thead');
echo html_writer::start_tag('tbody');

foreach ($students as $student) {
    $sub = $submissionsByUser[$student->id] ?? null;

    $statusLabel = get_string('nosubmissionyet', 'mod_eseecode');
    $statusClass = 'text-muted';
    $modified    = '—';
    $codeCell    = '—';

    if ($sub !== null) {
        if ($sub->status === 'submitted') {
            $statusLabel = html_writer::span(get_string('statussubmitted', 'mod_eseecode'), 'badge badge-success');
        } else {
            $statusLabel = html_writer::span(get_string('statusdraft', 'mod_eseecode'), 'badge badge-secondary');
        }
        $modified = userdate($sub->timemodified);

        $codeBody = !empty($sub->code) ? htmlspecialchars($sub->code, ENT_QUOTES, 'UTF-8') : '';
        $codeCell = html_writer::tag('details',
            html_writer::tag('summary', get_string('viewcode', 'mod_eseecode'), ['style' => 'cursor:pointer']) .
            html_writer::tag('pre',
                html_writer::tag('code', $codeBody),
                ['class' => 'bg-light p-3 rounded mt-2', 'style' => 'max-height:400px;overflow:auto;white-space:pre-wrap;']
            )
        );
    }

    $profileurl  = new moodle_url('/user/view.php', ['id' => $student->id, 'course' => $course->id]);
    $studentLink = html_writer::link($profileurl, fullname($student));

    echo html_writer::start_tag('tr');
    echo html_writer::tag('td', $studentLink);
    echo html_writer::tag('td', $statusLabel);
    echo html_writer::tag('td', $modified);
    echo html_writer::tag('td', $codeCell);
    echo html_writer::end_tag('tr');
}

echo html_writer::end_tag('tbody');
echo html_writer::end_tag('table');

echo $OUTPUT->footer();
