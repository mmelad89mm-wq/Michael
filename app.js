// -------------------------------
// البيانات المخزنة في localStorage
// -------------------------------
let teachers = JSON.parse(localStorage.getItem('teachers')) || [{ id: 't1', name: 'أ. أحمد' }];
let groups = JSON.parse(localStorage.getItem('groups')) || [{ id: 'g1', name: 'مجموعة الرياضيات', className: 'خامس', schedule: 'الاثنين 4م', teacherId: 't1' }];
let students = JSON.parse(localStorage.getItem('students')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
let grades = JSON.parse(localStorage.getItem('grades')) || [];

// Helper functions
function saveAll() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('groups', JSON.stringify(groups));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    localStorage.setItem('grades', JSON.stringify(grades));
    updateUIstats();
    refreshAllSelects();
}

// تحديث الإحصائيات
function updateUIstats() {
    document.getElementById('totalStudentsStat').innerText = students.length;
    document.getElementById('totalGroupsStat').innerText = groups.length;
    let unpaidCount = subscriptions.filter(s => s.status === 'غير مدفوع').length;
    document.getElementById('unpaidStat').innerText = unpaidCount;
}

// تحديث كل القوائم المنسدلة
function refreshAllSelects() {
    // teacher select
    let teacherSelect = document.getElementById('teacherSelect');
    if(teacherSelect) {
        teacherSelect.innerHTML = teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }
    // group select (general)
    let groupSelect = document.getElementById('groupSelect');
    if(groupSelect) groupSelect.innerHTML = groups.map(g => `<option value="${g.id}">${g.className} - ${g.name} (${g.schedule})</option>`).join('');
    
    // student group select (اضافة طالب)
    let studentGroupSel = document.getElementById('studentGroupSelect');
    if(studentGroupSel) studentGroupSel.innerHTML = groups.map(g => `<option value="${g.id}">${g.className} | ${g.name}</option>`).join('');
    
    // studentSelect (حذف)
    let studentSel = document.getElementById('studentSelect');
    if(studentSel) studentSel.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // attendanceStudentSelect
    let attStudent = document.getElementById('attendanceStudentSelect');
    if(attStudent) attStudent.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // subStudentSelect
    let subSt = document.getElementById('subStudentSelect');
    if(subSt) subSt.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // gradeStudentSelect
    let gradeSt = document.getElementById('gradeStudentSelect');
    if(gradeSt) gradeSt.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// 1. ادارة المدرسين
document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
    let name = document.getElementById('teacherName').value.trim();
    if(!name) return alert('ادخل اسم المدرس');
    let newId = 't'+Date.now();
    teachers.push({ id: newId, name });
    saveAll();
    document.getElementById('teacherName').value = '';
    alert('تم إضافة المدرس');
});
document.getElementById('deleteTeacherBtn')?.addEventListener('click', () => {
    let sel = document.getElementById('teacherSelect').value;
    if(confirm('حذف المدرس سيؤثر على المجموعات المرتبطة')) {
        teachers = teachers.filter(t => t.id !== sel);
        groups = groups.filter(g => g.teacherId !== sel);
        saveAll();
    }
});

// 2. المجموعات
document.getElementById('addGroupBtn')?.addEventListener('click', () => {
    let className = document.getElementById('className').value.trim();
    let groupName = document.getElementById('groupName').value.trim();
    let schedule = document.getElementById('groupSchedule').value.trim();
    if(!className || !groupName) return alert('املأ الحقول');
    let newGroup = { id: 'g'+Date.now(), className, name: groupName, schedule, teacherId: teachers[0]?.id || '' };
    groups.push(newGroup);
    saveAll();
    document.getElementById('className').value = '';
    document.getElementById('groupName').value = '';
    document.getElementById('groupSchedule').value = '';
});
document.getElementById('deleteGroupBtn')?.addEventListener('click', () => {
    let gid = document.getElementById('groupSelect').value;
    groups = groups.filter(g => g.id !== gid);
    students = students.filter(s => s.groupId !== gid); // حذف الطلاب المرتبطين
    saveAll();
});

// 3. الطلاب
document.getElementById('addStudentBtn')?.addEventListener('click', () => {
    let name = document.getElementById('studentName').value.trim();
    let phone = document.getElementById('parentPhone').value.trim();
    let groupId = document.getElementById('studentGroupSelect').value;
    let amount = parseFloat(document.getElementById('subscriptionAmount').value);
    if(!name || !groupId) return alert('اسم الطالب والمجموعة مطلوبة');
    let newStudent = { id: 's'+Date.now(), name, parentPhone: phone, groupId, subscriptionAmount: amount || 150 };
    students.push(newStudent);
    saveAll();
    document.getElementById('studentName').value = '';
    document.getElementById('parentPhone').value = '';
});
document.getElementById('deleteStudentBtn')?.addEventListener('click', () => {
    let sid = document.getElementById('studentSelect').value;
    students = students.filter(s => s.id !== sid);
    attendance = attendance.filter(a => a.studentId !== sid);
    subscriptions = subscriptions.filter(sub => sub.studentId !== sid);
    grades = grades.filter(g => g.studentId !== sid);
    saveAll();
});

// 4. الحضور
document.getElementById('markPresentBtn')?.addEventListener('click', () => markAttendance('حاضر'));
document.getElementById('markAbsentBtn')?.addEventListener('click', () => markAttendance('غائب'));
function markAttendance(status) {
    let studentId = document.getElementById('attendanceStudentSelect').value;
    let date = document.getElementById('attendanceDate').value;
    if(!studentId || !date) return alert('اختر الطالب والتاريخ');
    let existing = attendance.findIndex(a => a.studentId === studentId && a.date === date);
    let record = { studentId, date, status };
    if(existing !== -1) attendance[existing] = record;
    else attendance.push(record);
    saveAll();
    alert(`تم تسجيل ${status}`);
}
document.getElementById('viewAttendanceBtn')?.addEventListener('click', () => {
    let sid = document.getElementById('attendanceStudentSelect').value;
    let student = students.find(s=> s.id === sid);
    if(!student) return;
    let logs = attendance.filter(a=> a.studentId === sid).sort((a,b)=> new Date(b.date) - new Date(a.date));
    let total = logs.length;
    let presentCount = logs.filter(l=> l.status === 'حاضر').length;
    let percent = total ? ((presentCount/total)*100).toFixed(1) : 0;
    document.getElementById('attendanceLog').innerHTML = `<strong>سجل ${student.name}:</strong> نسبة الحضور ${percent}% (${presentCount}/${total})<br>${logs.map(l=> `${l.date}: ${l.status}`).join('<br>') || 'لا توجد سجلات'}`;
});

// 5. الاشتراكات
document.getElementById('markPaidBtn')?.addEventListener('click', () => setSubscriptionStatus('مدفوع'));
document.getElementById('markUnpaidBtn')?.addEventListener('click', () => setSubscriptionStatus('غير مدفوع'));
function setSubscriptionStatus(status) {
    let studentId = document.getElementById('subStudentSelect').value;
    let month = document.getElementById('subMonth').value;
    if(!studentId || !month) return alert('اختر الطالب والشهر');
    let existingIndex = subscriptions.findIndex(s => s.studentId === studentId && s.month === month);
    let subData = { studentId, month, status };
    if(existingIndex !== -1) subscriptions[existingIndex] = subData;
    else subscriptions.push(subData);
    saveAll();
    alert(`تم تحديث الاشتراك إلى ${status}`);
}
document.getElementById('showUnpaidListBtn')?.addEventListener('click', () => {
    let unpaidSubs = subscriptions.filter(s => s.status === 'غير مدفوع');
    let studentMap = Object.fromEntries(students.map(s=>[s.id, s]));
    let html = '<ul>';
    unpaidSubs.forEach(sub => {
        let student = studentMap[sub.studentId];
        if(student) html += `<li>${student.name} - شهر ${sub.month} (هاتف ولي الأمر: ${student.parentPhone || 'غير موجود'})</li>`;
    });
    html += '</ul>';
    if(unpaidSubs.length === 0) html = '<p>جميع الاشتراكات مدفوعة ✅</p>';
    document.getElementById('unpaidList').innerHTML = html;
});

// 6. الدرجات
document.getElementById('addGradeBtn')?.addEventListener('click', () => {
    let studentId = document.getElementById('gradeStudentSelect').value;
    let examType = document.getElementById('examType').value.trim();
    let score = parseFloat(document.getElementById('examScore').value);
    if(!studentId || !examType || isNaN(score)) return alert('املأ البيانات');
    grades.push({ id: 'grade'+Date.now(), studentId, examType, score, date: new Date().toISOString().slice(0,10) });
    saveAll();
    alert('تمت إضافة الدرجة');
    document.getElementById('examType').value = '';
    document.getElementById('examScore').value = '';
});
document.getElementById('viewGradesBtn')?.addEventListener('click', () => {
    let studentId = document.getElementById('gradeStudentSelect').value;
    let student = students.find(s=> s.id === studentId);
    if(!student) return;
    let studentGrades = grades.filter(g => g.studentId === studentId);
    let total = studentGrades.reduce((acc,g)=> acc + g.score, 0);
    let avg = studentGrades.length ? (total/studentGrades.length).toFixed(1) : 0;
    let table = `<strong>تقرير درجات ${student.name}</strong><br>المعدل: ${avg} من 100<br><table border="1" style="width:100%"><tr><th>نوع الاختبار</th><th>الدرجة</th><th>التاريخ</th></tr>`;
    studentGrades.forEach(g=> { table += `<tr><td>${g.examType}</td><td>${g.score}</td><td>${g.date}</td></tr>`; });
    table += '</table>';
    document.getElementById('gradesResult').innerHTML = table;
});

// 7. التقارير
document.getElementById('reportAttendanceBtn')?.addEventListener('click', () => {
    let report = students.map(s => {
        let logs = attendance.filter(a=> a.studentId === s.id);
        let total = logs.length;
        let present = logs.filter(l=> l.status === 'حاضر').length;
        let percent = total ? ((present/total)*100).toFixed(1) : 0;
        return { name: s.name, حضور: `${present}/${total} (${percent}%)` };
    });
    alert(JSON.stringify(report, null, 2));
    document.getElementById('attendanceLog').innerHTML = '<pre>' + JSON.stringify(report, null, 2) + '</pre>';
});

// تصدير Excel
document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
    let studentsData = students.map(s => {
        let sub = subscriptions.filter(sub=> sub.studentId === s.id);
        let lastSub = sub[sub.length-1]?.status || 'غير مسجل';
        return { الاسم: s.name, 'رقم ولي الأمر': s.parentPhone, المجموعة: groups.find(g=>g.id===s.groupId)?.name || '', 'حالة الاشتراك': lastSub };
    });
    const ws = XLSX.utils.json_to_sheet(studentsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقارير');
    XLSX.writeFile(wb, `تقرير_الطلاب_${new Date().toISOString().slice(0,10)}.xlsx`);
});

// إرسال واتساب (محاكاة فتح الرابط)
function sendWhatsapp(phone, message) {
    if(!phone) return alert('رقم ولي الأمر غير موجود');
    let url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
document.getElementById('sendWhatsappMsgBtn')?.addEventListener('click', () => {
    let customMsg = document.getElementById('customWhatsMsg').value;
    if(!customMsg) return alert('اكتب نص الرسالة');
    students.forEach(s => {
        if(s.parentPhone) sendWhatsapp(s.parentPhone, customMsg);
    });
    alert('تم فتح محادثات واتساب لكل ولي أمر (افتح يدويًا لكل جهة)');
});
document.getElementById('sendSpecificAbsentBtn')?.addEventListener('click', () => {
    // الطلاب الغائبين باستمرار: غياب أكثر من 3 مرات خلال آخر 30 يوم
    let thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let absences = attendance.filter(a => a.status === 'غائب' && new Date(a.date) >= thirtyDaysAgo);
    let countMap = new Map();
    absences.forEach(a => countMap.set(a.studentId, (countMap.get(a.studentId)||0) + 1));
    let frequentAbsent = Array.from(countMap.entries()).filter(([_,count]) => count >= 2).map(([id,_])=> students.find(s=> s.id === id));
    frequentAbsent.forEach(s => {
        if(s && s.parentPhone) sendWhatsapp(s.parentPhone, `⚠️ تنبيه: الطالب ${s.name} غاب عدة مرات، نرجو متابعة الحضور. ${document.getElementById('customWhatsMsg').value || ''}`);
    });
    alert(`تم إرسال تنبيه لـ ${frequentAbsent.length} ولي أمر`);
});

// تحميل أولي
refreshAllSelects();
updateUIstats();
document.getElementById('attendanceDate').valueAsDate = new Date();
document.getElementById('subMonth').value = new Date().toISOString().slice(0,7);