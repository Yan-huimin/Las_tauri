#[cxx::bridge]
mod ffi {

    struct PointXYZ {
        x: f32,
        y: f32,
        z: f32,
    }

    unsafe extern "C++" {
        include!("cpp/pcl_wrapper.h");

        fn generate_point_cloud() -> Vec<PointXYZ>;
    }
}

pub fn test_pcl() {
    let points = ffi::generate_point_cloud();

    println!("收到点云数据：");

    for p in points {
        println!("({}, {}, {})", p.x, p.y, p.z);
    }
}