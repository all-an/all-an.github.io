usingnamespace @import("std").builtin;
/// Deprecated
pub const arch = Target.current.cpu.arch;
/// Deprecated
pub const endian = Target.current.cpu.arch.endian();
pub const output_mode = OutputMode.Exe;
pub const link_mode = LinkMode.Static;
pub const is_test = false;
pub const single_threaded = false;
pub const abi = Abi.msvc;
pub const cpu: Cpu = Cpu{
    .arch = .x86_64,
    .model = &Target.x86.cpu.sandybridge,
    .features = Target.x86.featureSet(&[_]Target.x86.Feature{
        .@"64bit",
        .@"avx",
        .@"cmov",
        .@"cx16",
        .@"cx8",
        .@"false_deps_popcnt",
        .@"fast_15bytenop",
        .@"fast_scalar_fsqrt",
        .@"fast_shld_rotate",
        .@"fxsr",
        .@"idivq_to_divl",
        .@"macrofusion",
        .@"merge_to_threeway_branch",
        .@"mmx",
        .@"nopl",
        .@"pclmul",
        .@"popcnt",
        .@"sahf",
        .@"slow_3ops_lea",
        .@"slow_unaligned_mem_32",
        .@"sse",
        .@"sse2",
        .@"sse3",
        .@"sse4_1",
        .@"sse4_2",
        .@"ssse3",
        .@"vzeroupper",
        .@"x87",
        .@"xsave",
        .@"xsaveopt",
    }),
};
pub const os = Os{
    .tag = .windows,
    .version_range = .{ .windows = .{
        .min = .win10_20h1,
        .max = .win10_20h1,
    }},
};
pub const object_format = ObjectFormat.coff;
pub const mode = Mode.Debug;
pub const link_libc = false;
pub const link_libcpp = false;
pub const have_error_return_tracing = true;
pub const valgrind_support = false;
pub const position_independent_code = true;
pub const strip_debug_info = false;
pub const code_model = CodeModel.default;
