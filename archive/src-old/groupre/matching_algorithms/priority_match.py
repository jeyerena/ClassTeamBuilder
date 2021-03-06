'''This module contains the priority_match method used by groupre.'''

import random
from typing import List

import groupre_globals
from data_structures import Chair, Student, TeamMember, TeamStructure

from .fallback import fallback
from .range_preference import range_preference


def priority_match(student: Student, chairs: List[Chair], team_fields: List[str], team_structures: List[TeamStructure]):
    '''This method will find a chair that is suitable for the student based
    on their preferences.'''

    priority_score_val = 0

    # Find the possible_chairs that best match this student's priorities.
    scored_chairs = {}
    for chair in chairs:
        score = 0
        for preference in student.preferences:
            pref_names = []

            # NOTE "NOT" preference modifier:
            if '!' in preference.name:
                not_modifier = True
                pref_names.append(preference.name[1:len(preference.name)])
            else:
                not_modifier = False
                pref_names.append(preference.name)

            # NOTE "OR" preference modifier:
            if '|' in preference.name:
                #or_modifier = True
                pref_names.append(preference.name.split('|'))

            for pref_name in pref_names:
                if ':' in pref_name:
                    score_result = range_preference(pref_name, chair)
                elif pref_name in chair.attributes:
                    score_result = 1
                else:
                    score_result = 0

                if not_modifier:
                    score -= score_result
                else:
                    score += score_result

        scored_chairs.update({chair: score})

    max_score = max(scored_chairs.values())

    if max_score > 0:
        priority_score_val += max_score

    if groupre_globals.FALLBACK_ENABLED and max_score == 0:
        # We likely need to see if fallback chairs can provide
        # a better maximum score for this student.

        # Re-score the chairs while looking for fallback options this time.
        for chair in chairs:
            score = 0
            for preference in student.preferences:
                score += fallback(preference, chair)
            scored_chairs.update({chair: score})
        max_score = max(scored_chairs.values())

    best_chairs = [
        chair for chair in scored_chairs if scored_chairs[chair] == max_score]

    # Randomize and choose a chair.
    chair = random.choice(best_chairs)
    chairs.remove(chair)

    # Fill out data fields for the pair we have matched.
    data_fields = []
    data_fields.append(student.student_id)

    student_name = student.student_name.split(',')
    name = ''
    for part in student_name:
        name += part

    data_fields.append(name)
    data_fields.append(student.vip)
    data_fields.append(student.score)
    data_fields.append(chair.chair_id)
    data_fields.append(chair.team_id)

    unmatched_preferences = ''
    for preference in student.preferences:
        # NOTE "NOT" preference modifier:
        if '!' in preference.name:
            not_modifier = True
            pref_name = preference.name[1:len(preference.name)]
        else:
            not_modifier = False
            pref_name = preference.name

        found_attr = False
        if ':' in pref_name:
            range_name = pref_name.split('-', 1)[0]
            range_split = pref_name.split('-', 1)[1].split(':', 1)
            range_start = int(range_split[0])
            range_end = int(range_split[1])

            for attribute in (attr for attr in chair.attributes if range_name in attr):
                attr_level = int(attribute.split('-', 1)[1])
                if groupre_globals.FALLBACK_ENABLED:
                    limit = 0
                    if range_name == 'front':
                        limit = groupre_globals.FALLBACK_LIMIT_FRONT
                    elif range_name == 'back':
                        limit = groupre_globals.FALLBACK_LIMIT_BACK
                    elif range_name == 'aisle':
                        limit = groupre_globals.FALLBACK_LIMIT_AISLE

                    if (attr_level >= range_start
                            and attr_level <= range_end + limit):
                        found_attr = True
                else:
                    if (attr_level >= range_start
                            and attr_level <= range_end):
                        found_attr = True
        elif (groupre_globals.FALLBACK_ENABLED
              and pref_name != 'left-handed'  # TODO Change left-handed to not have a '-'
              and '-' in pref_name):
            pref_split = pref_name.split("-", 1)
            pref_prefix = pref_split[0]
            pref_level = int(pref_split[1])
            pref_start = pref_level
            pref_end = pref_level

            if pref_prefix == 'front':
                pref_end += groupre_globals.FALLBACK_LIMIT_FRONT
            elif pref_prefix == 'back':
                pref_end += groupre_globals.FALLBACK_LIMIT_BACK
            elif pref_prefix == 'aisle':
                pref_end += groupre_globals.FALLBACK_LIMIT_AISLE

            for attribute in chair.attributes:
                if pref_prefix in attribute:
                    attr_level = int(attribute.split('-', 1)[1])
                    if (attr_level <= pref_end) and (attr_level >= pref_start):
                        found_attr = True

        if not_modifier:
            if found_attr:
                unmatched_preferences += preference.name + ';'
        elif not found_attr:
            if pref_name not in chair.attributes:
                unmatched_preferences += pref_name + ';'

    unmatched_len = len(unmatched_preferences)
    if unmatched_len == 0:
        priority_score_val = len(student.preferences)
    else:
        unmatched_split = (unmatched_preferences[0:len(
            unmatched_preferences) - 1].split(';'))
        priority_score_val = (len(student.preferences) - len(unmatched_split))

    priority_score = '{} of {}'.format(
        priority_score_val, student.specificness)

    # Debug value to see how well priority matching satisfied student priorities.
    groupre_globals.STUDENT_PRIORITY_VALUE += priority_score_val
    groupre_globals.STUDENT_PRIORITY_TOTAL += student.specificness

    data_fields.append(priority_score)
    data_fields.append(unmatched_preferences[0:len(unmatched_preferences) - 1])

    # NOTE debug
    # string = ''
    # for preference in student.preferences:
    #     string += preference.name + ';'
    # data_fields.append(string)

    ret = TeamMember(team_fields, data_fields)

    # Add member to team_structure.
    # TODO Use this for score-matching and other team-related matching criteria.
    this_team_id = ret.entry_data['TeamID']
    for team_structure in team_structures:
        if int(this_team_id) == team_structure.team_id:
            team_structure.add_member(student)

    return ret
