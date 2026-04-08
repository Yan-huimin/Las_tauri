fn main() {
    cxx_build::bridge("src/pcl.rs")
        .include("/usr/include/pcl-1.14")
        .include("./")
        .include("/usr/include/eigen3")
        .file("cpp/pcl_wrapper.cpp")
        .flag_if_supported("-std=c++17")
        .compile("pcl_wrapper");

    println!("cargo:rerun-if-changed=src/pcl.rs");
    println!("cargo:rerun-if-changed=src-tauri/cpp/pcl_wrapper.cpp");

    tauri_build::build();
}