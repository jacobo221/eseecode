<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Retrieve the submission record for a student, or null if none exists.
 */
function eseecode_get_submission(int $eseecodeid, int $userid): ?stdClass {
    global $DB;
    $record = $DB->get_record('eseecode_submissions', [
        'eseecodeid' => $eseecodeid,
        'userid'     => $userid,
    ]);
    return $record ?: null;
}

/**
 * Return true if the student has a final submission (status = 'submitted').
 */
function eseecode_is_submitted(int $eseecodeid, int $userid): bool {
    $submission = eseecode_get_submission($eseecodeid, $userid);
    return $submission !== null && $submission->status === 'submitted';
}

/**
 * Return all submissions for an activity, joined with user data, ordered by lastname.
 *
 * @return stdClass[]  Indexed by submission id; each row has fullname, email, status, code, timemodified.
 */
function eseecode_get_all_submissions(int $eseecodeid): array {
    global $DB;
    return $DB->get_records_sql(
        "SELECT s.id, s.userid, s.code, s.status, s.timecreated, s.timemodified,
                " . $DB->sql_fullname('u.firstname', 'u.lastname') . " AS fullname,
                u.email
           FROM {eseecode_submissions} s
           JOIN {user} u ON u.id = s.userid
          WHERE s.eseecodeid = :eseecodeid
       ORDER BY u.lastname ASC, u.firstname ASC",
        ['eseecodeid' => $eseecodeid]
    );
}
