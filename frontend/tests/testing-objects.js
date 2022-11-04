/**
 * Immutable objects to use for unit tests.
 */

// Dummy departments
const DUM = 'DUM';
const FOO = 'FOO';

export const quarters = [
    {
        "quarter": "20202",
        "qyy": "S20",
        "name": "SPRING 2020",
        "category": "SPRING",
        "academicYear": "2019-2020",
        "firstDayOfClasses": "2020-03-30T00:00:00",
        "lastDayOfClasses": "2020-06-05T00:00:00",
        "firstDayOfFinals": "2020-06-06T00:00:00",
        "lastDayOfFinals": "2020-06-12T00:00:00",
        "firstDayOfQuarter": "2020-03-30T00:00:00",
        "lastDayOfSchedule": "2020-06-21T00:00:00",
        "pass1Begin": "2020-02-18T09:00:00",
        "pass2Begin": "2020-02-27T09:00:00",
        "pass3Begin": "2020-03-09T09:00:00",
        "feeDeadline": "2020-03-16T00:00:00",
        "lastDayToAddUnderGrad": "2020-04-17T00:00:00",
        "lastDayToAddGrad": "2020-04-17T00:00:00"
    }, {
        "quarter": "20203",
        "qyy": "M20",
        "name": "SUMMER 2020",
        "category": "SUMMER",
        "academicYear": "2019-2020",
        "firstDayOfClasses": "2020-06-22T00:00:00",
        "lastDayOfClasses": "2020-09-11T00:00:00",
        "firstDayOfFinals": "2020-09-12T00:00:00",
        "lastDayOfFinals": "2020-09-12T00:00:00",
        "firstDayOfQuarter": "2020-06-22T00:00:00",
        "lastDayOfSchedule": "2020-09-26T00:00:00",
        "pass1Begin": "2020-04-06T09:00:00",
        "pass2Begin": "2020-04-20T09:00:00",
        "pass3Begin": "2020-05-04T09:00:00",
        "feeDeadline": "2020-06-24T00:00:00",
        "lastDayToAddUnderGrad": "2020-07-13T00:00:00",
        "lastDayToAddGrad": "2020-07-13T00:00:00"
    }
]

export const classSections = {
    DUM: [
        {
            id: 2,
            courseId: 1,
            timesAndPlaces: [
                {
                    id: 3,
                    daysOfWeek: [
                        'MONDAY',
                        'FRIDAY'
                    ],
                    beginTime: '11:00:00',
                    endTime: '11:50:00',
                    room: '100',
                    building: 'Building A'
                }
            ],
            enrollCode: '00018',
            maxEnroll: 250,
            enrollCount: 100,
            instructor: 'BRAD HALL',
            departmentApprovalRequired: false,
            instructorApprovalRequired: false,
            courseIsCancelled: false,
            classIsClosed: false,
            sectionId: '0100',
            lectureSectionGroup: DUM + '200_01',
            lecture: true
        },
        {
            id: 3,
            courseId: 1,
            timesAndPlaces: [
                {
                    id: 3,
                    daysOfWeek: [
                        'MONDAY',
                    ],
                    beginTime: '17:00:00',
                    endTime: '17:50:00',
                    room: '100',
                    building: 'Small Building'
                }
            ],
            enrollCode: '00018',
            maxEnroll: 250,
            enrollCount: 100,
            instructor: 'MATTHEW PETERSCHMIDT',
            departmentApprovalRequired: false,
            instructorApprovalRequired: false,
            courseIsCancelled: false,
            classIsClosed: false,
            sectionId: '0101',
            lectureSectionGroup: DUM + '200_01',
            lecture: false
        }
    ],
    FOO: [
        {
            id: 3,
            courseId: 2,
            timesAndPlaces: [
                {
                    id: 3,
                    daysOfWeek: [
                        'TUESDAY',
                        'THURSDAY'
                    ],
                    beginTime: '12:00:00',
                    endTime: '12:50:00',
                    room: '1303',
                    building: 'Lecture Hall A'
                }
            ],
            enrollCode: '00018',
            maxEnroll: 250,
            enrollCount: 100,
            instructor: 'TIM NGUYEN',
            departmentApprovalRequired: false,
            instructorApprovalRequired: false,
            courseIsCancelled: false,
            classIsClosed: false,
            sectionId: '0100',
            lectureSectionGroup: FOO + '101_01',
            lecture: true
        },
        {
            id: 4,
            courseId: 2,
            timesAndPlaces: [
                {
                    id: 3,
                    daysOfWeek: [
                        'THURSDAY',
                    ],
                    beginTime: '13:00:00',
                    endTime: '13:50:00',
                    room: '232',
                    building: 'Other Building'
                }
            ],
            enrollCode: '00018',
            maxEnroll: 250,
            enrollCount: 100,
            instructor: 'JASON FREEBERG',
            departmentApprovalRequired: false,
            instructorApprovalRequired: false,
            courseIsCancelled: false,
            classIsClosed: false,
            sectionId: '0101',
            lectureSectionGroup: FOO + '101_01',
            lecture: false
        }
    ]
}

export const courses = [
    {
        id: 1,
        classSections: classSections.DUM,
        quarter: quarters[0].quarter,
        title: 'DUMMY COURSE 1',
        courseNumber: '200',
        courseNumberPrefix: '',
        courseNumberSuffix: '',
        departmentCode: DUM,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
        college: 'L&S',
        units: 4,
        courseId: DUM + ' 200  ',
        unitsVariableHigh: 0,
        unitsVariableLow: 0,
        fullCourseNumber: DUM + ' 200'
    },
    {
        id: 2,
        classSections: classSections.FOO,
        quarter: quarters[0].quarter,
        title: 'NOT REAL COURSE 101',
        courseNumber: '101',
        courseNumberPrefix: '',
        courseNumberSuffix: '',
        departmentCode: FOO,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
        college: 'L&S',
        units: 4,
        courseId: FOO + ' 101  ',
        unitsVariableHigh: 0,
        unitsVariableLow: 0,
        fullCourseNumber: FOO + ' 101'
    },
]

// All four combinations of the classSections
export const schedules = [
    {
        id: null,
        quarter: quarters[0].quarter,
        scheduledClasses: [
            classSections.DUM[0],
            classSections.FOO[0]
        ],
        selectedClasses: classSections.DUM.concat(classSections.FOO),
        customEvents: []
    },
    {
        id: null,
        quarter: quarters[0].quarter,
        scheduledClasses: [
            classSections.DUM[0],
            classSections.FOO[1]
        ],
        selectedClasses: classSections.DUM.concat(classSections.FOO),
        customEvents: []
    },
    {
        id: null,
        quarter: quarters[0].quarter,
        scheduledClasses: [
            classSections.DUM[1],
            classSections.FOO[0]
        ],
        selectedClasses: classSections.DUM.concat(classSections.FOO),
        customEvents: []
    },
    {
        id: null,
        quarter: quarters[0].quarter,
        scheduledClasses: [
            classSections.DUM[1],
            classSections.FOO[1]
        ],
        selectedClasses: classSections.DUM.concat(classSections.FOO),
        customEvents: []
    },
]

export const userAttributes = {
    principal: {
        attributes: {
            email: 'userEmail@email.com',
            fullName: 'Joe Smith',
            picture: 'https://imgur.com/gallery/Q3Ton'
        }
    }
}

export const customEvent = {
    name: 'testEvent',
    timeLocations: [
        { 
            days: "", 
            beginTime: "10:00:00", 
            endTime: "12:00:00", 
            fullDays: [
                "FRIDAY"
            ] 
        }
    ],
    backgroundColor: "#FEBC11",
    borderColor: 'red'
}
