<?php
namespace mod_eseecode\external;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->libdir . '/externallib.php');

/**
 * External function: save the current code as a draft.
 *
 * Silently overwrites any existing draft. Returns an error if the student
 * has already made a final submission.
 */
class save_draft extends \external_api {

    public static function execute_parameters(): \external_function_parameters {
        return new \external_function_parameters([
            'cmid' => new \external_value(PARAM_INT, 'Course module ID'),
            'code' => new \external_value(PARAM_RAW, 'Student code to save'),
        ]);
    }

    public static function execute(int $cmid, string $code): array {
        global $DB, $USER;

        ['cmid' => $cmid, 'code' => $code] = self::validate_parameters(
            self::execute_parameters(),
            ['cmid' => $cmid, 'code' => $code]
        );

        [$course, $cm] = get_course_and_cm_from_cmid($cmid, 'eseecode');
        $context = \context_module::instance($cm->id);
        self::validate_context($context);
        require_capability('mod/eseecode:submit', $context);

        $existing = $DB->get_record('eseecode_submissions', [
            'eseecodeid' => $cm->instance,
            'userid'     => $USER->id,
        ]);

        if ($existing && $existing->status === 'submitted') {
            return [
                'success' => false,
                'message' => get_string('alreadysubmitted', 'mod_eseecode'),
            ];
        }

        $now = time();
        if ($existing) {
            $existing->code         = $code;
            $existing->timemodified = $now;
            $DB->update_record('eseecode_submissions', $existing);
        } else {
            $DB->insert_record('eseecode_submissions', (object) [
                'eseecodeid'   => $cm->instance,
                'userid'       => $USER->id,
                'code'         => $code,
                'status'       => 'draft',
                'timecreated'  => $now,
                'timemodified' => $now,
            ]);
        }

        return [
            'success' => true,
            'message' => get_string('draftsaved', 'mod_eseecode'),
        ];
    }

    public static function execute_returns(): \external_single_structure {
        return new \external_single_structure([
            'success' => new \external_value(PARAM_BOOL, 'Whether the save succeeded'),
            'message' => new \external_value(PARAM_TEXT, 'Feedback message for the user'),
        ]);
    }
}
