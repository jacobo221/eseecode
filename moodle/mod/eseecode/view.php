<?php
require_once('../../config.php');
require_once($CFG->dirroot . '/mod/eseecode/locallib.php');

$id = required_param('id', PARAM_INT); // Course module id

[$course, $cm] = get_course_and_cm_from_cmid($id, 'eseecode');
$eseecode = $DB->get_record('eseecode', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/eseecode:view', $context);

$PAGE->set_url('/mod/eseecode/view.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($eseecode->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_cm($cm, $course, $eseecode);

// Mark the activity as viewed for completion tracking.
$completion = new completion_info($course);
$completion->set_module_viewed($cm);

$isTeacher   = has_capability('mod/eseecode:viewsubmissions', $context);
$canSubmit   = has_capability('mod/eseecode:submit', $context);
$submission  = null;
$isSubmitted = false;
$savedCode   = '';

if ($canSubmit) {
    $submission  = eseecode_get_submission($eseecode->id, $USER->id);
    $isSubmitted = ($submission !== null && $submission->status === 'submitted');
    $savedCode   = $submission ? $submission->code : '';
}

echo $OUTPUT->header();
echo $OUTPUT->heading(format_string($eseecode->name));

// Standard intro box (shown in activity, toggleable by teacher).
if (!empty($eseecode->intro)) {
    echo $OUTPUT->box(
        format_module_intro('eseecode', $eseecode, $cm->id),
        'generalbox mod_introbox',
        'eseecodedescription'
    );
}

// Problem statement.
if (!empty($eseecode->statement)) {
    echo html_writer::start_div('card mb-4');
    echo html_writer::start_div('card-body');
    echo format_text($eseecode->statement, $eseecode->statementformat, ['context' => $context]);
    echo html_writer::end_div();
    echo html_writer::end_div();
}

// Teacher: link to submissions overview.
if ($isTeacher) {
    $submissionsurl = new moodle_url('/mod/eseecode/submissions.php', ['id' => $cm->id]);
    echo html_writer::div(
        html_writer::link($submissionsurl, get_string('viewsubmissions', 'mod_eseecode'), ['class' => 'btn btn-primary']),
        'mb-4'
    );
}

// Already-submitted notice for students.
if ($canSubmit && $isSubmitted) {
    echo $OUTPUT->notification(get_string('submittednotice', 'mod_eseecode'), \core\output\notification::NOTIFY_SUCCESS);
}

// IDE iframe (no src yet — set by AMD module to avoid race condition on load).
echo html_writer::start_div('mb-3');
echo html_writer::tag('iframe', '', [
    'id'            => 'eseecode-iframe',
    'style'         => 'width:100%;height:650px;border:1px solid #dee2e6;border-radius:0.375rem;',
    'allowfullscreen' => 'allowfullscreen',
    'title'         => get_string('modulename', 'mod_eseecode'),
]);
echo html_writer::end_div();

// Action buttons for students who have not yet submitted.
if ($canSubmit && !$isSubmitted) {
    echo html_writer::start_div('d-flex mb-4 align-items-center', ['id' => 'eseecode-actions']);
    echo html_writer::tag('button', get_string('savedraft', 'mod_eseecode'), [
        'id'    => 'eseecode-save',
        'class' => 'btn btn-secondary mr-2',
        'type'  => 'button',
    ]);
    echo html_writer::tag('button', get_string('submitcode', 'mod_eseecode'), [
        'id'    => 'eseecode-submit',
        'class' => 'btn btn-primary',
        'type'  => 'button',
    ]);
    echo html_writer::span('', 'ml-2 text-muted small', ['id' => 'eseecode-status']);
    echo html_writer::end_div();
}

// Pre-load strings needed by the JS confirm dialog.
$PAGE->requires->string_for_js('confirmsubmit', 'mod_eseecode');

// Boot the AMD module.
$PAGE->requires->js_call_amd('mod_eseecode/editor', 'init', [
    $cm->id,
    $savedCode,
    $isSubmitted,
    $isTeacher,
]);

echo $OUTPUT->footer();
