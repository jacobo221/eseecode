<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Add a new eseecode activity instance and return its id.
 */
function eseecode_add_instance(stdClass $eseecode, ?mod_eseecode_mod_form $mform = null): int {
    global $DB;

    $eseecode->timecreated  = time();
    $eseecode->timemodified = time();

    eseecode_set_statement_fields($eseecode);

    return $DB->insert_record('eseecode', $eseecode);
}

/**
 * Update an existing eseecode instance.
 */
function eseecode_update_instance(stdClass $eseecode, ?mod_eseecode_mod_form $mform = null): bool {
    global $DB;

    $eseecode->timemodified = time();
    $eseecode->id           = $eseecode->instance;

    eseecode_set_statement_fields($eseecode);

    return $DB->update_record('eseecode', $eseecode);
}

/**
 * Delete an eseecode instance and all its submissions.
 */
function eseecode_delete_instance(int $id): bool {
    global $DB;

    if (!$DB->get_record('eseecode', ['id' => $id])) {
        return false;
    }

    $DB->delete_records('eseecode_submissions', ['eseecodeid' => $id]);
    $DB->delete_records('eseecode', ['id' => $id]);

    return true;
}

/**
 * Return the features this module supports.
 */
function eseecode_supports(string $feature): ?bool {
    switch ($feature) {
        case FEATURE_MOD_INTRO:
        case FEATURE_SHOW_DESCRIPTION:
            return true;
        case FEATURE_BACKUP_MOODLE2:
            return false;
        default:
            return null;
    }
}

/**
 * Extract statement text and format from the editor element into flat fields.
 */
function eseecode_set_statement_fields(stdClass &$eseecode): void {
    if (!empty($eseecode->statement_editor) && is_array($eseecode->statement_editor)) {
        $eseecode->statement       = $eseecode->statement_editor['text'];
        $eseecode->statementformat = $eseecode->statement_editor['format'] ?? FORMAT_HTML;
    }
}
