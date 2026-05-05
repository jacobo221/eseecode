<?php
defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/course/moodleform_mod.php');

class mod_eseecode_mod_form extends moodleform_mod {

    public function definition(): void {
        $mform = $this->_form;

        // --- General section ---
        $mform->addElement('header', 'general', get_string('general', 'form'));

        $mform->addElement('text', 'name', get_string('name'), ['size' => 64]);
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');

        $this->standard_intro_elements(get_string('modulename', 'mod_eseecode'));

        // --- Statement section ---
        $mform->addElement('header', 'statementhdr', get_string('statement', 'mod_eseecode'));
        $mform->setExpanded('statementhdr');

        $mform->addElement(
            'editor',
            'statement_editor',
            get_string('statement', 'mod_eseecode'),
            ['rows' => 15],
            ['maxfiles' => 0, 'noclean' => false]
        );
        $mform->setType('statement_editor', PARAM_RAW);
        $mform->addHelpButton('statement_editor', 'statement', 'mod_eseecode');

        // --- Standard course module elements (availability, grouping, etc.) ---
        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }

    public function data_preprocessing(&$defaultvalues) {
        parent::data_preprocessing($defaultvalues);
        $defaultvalues['statement_editor'] = [
            'text'   => $defaultvalues['statement']       ?? '',
            'format' => $defaultvalues['statementformat'] ?? FORMAT_HTML,
        ];
    }
}
